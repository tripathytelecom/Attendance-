import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const attendanceForm = document.getElementById('attendanceForm');
    const attendanceTableBody = document.querySelector('#attendanceTable tbody');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check Authentication State
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // User is not signed in, redirect to login page
            window.location.href = 'login.html';
        } else {
            console.log("User is signed in:", user.email);
            // Load data only when authenticated
            loadAttendanceData();
        }
    });

    // Logout Functionality
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Error signing out. See console for details.");
        }
    });

    // Load Attendance Data (Real-time listener)
    function loadAttendanceData() {
        const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));

        onSnapshot(q, (snapshot) => {
            attendanceTableBody.innerHTML = '';

            if (snapshot.empty) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" style="text-align:center;">No records found</td>`;
                attendanceTableBody.appendChild(row);
                return;
            }

            snapshot.forEach((documentSnapshot) => {
                const record = documentSnapshot.data();
                const recordId = documentSnapshot.id; // Get the document ID for deletion
                const row = document.createElement('tr');

                // Format timestamp
                const dateDisplay = record.date || (record.timestamp ? new Date(record.timestamp.seconds * 1000).toLocaleDateString() : 'N/A');
                const timeDisplay = record.time || (record.timestamp ? new Date(record.timestamp.seconds * 1000).toLocaleTimeString() : 'N/A');

                row.innerHTML = `
                    <td>${record.name}</td>
                    <td>${dateDisplay}</td>
                    <td>${timeDisplay}</td>
                    <td><button class="delete-btn" data-id="${recordId}" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Delete</button></td>
                `;
                attendanceTableBody.appendChild(row);
            });

            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this record?')) {
                        try {
                            await deleteDoc(doc(db, "attendance", id));
                            console.log("Document successfully deleted!");
                        } catch (error) {
                            console.error("Error removing document: ", error);
                            alert("Error deleting record: " + error.message);
                        }
                    }
                });
            });

        }, (error) => {
            console.error("Error getting documents: ", error);
            attendanceTableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Error loading data: ${error.message}</td></tr>`;
        });
    }

    // Handle Form Submission
    attendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim();

        if (name) {
            const now = new Date();

            try {
                await addDoc(collection(db, "attendance"), {
                    name: name,
                    date: now.toLocaleDateString(),
                    time: now.toLocaleTimeString(),
                    timestamp: serverTimestamp(), // Firestore server timestamp
                    userId: auth.currentUser.uid, // Track who added it
                    userEmail: auth.currentUser.email
                });

                nameInput.value = ''; // Clear input
                alert(`Attendance marked for ${name}!`);
            } catch (error) {
                console.error("Error adding document: ", error);
                alert("Error marking attendance: " + error.message);
            }
        }
    });
});
