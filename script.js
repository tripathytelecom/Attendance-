<<<<<<< HEAD
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
                row.innerHTML = `<td colspan="3" style="text-align:center;">No records found</td>`;
                attendanceTableBody.appendChild(row);
                return;
            }

            snapshot.forEach((doc) => {
                const record = doc.data();
                const row = document.createElement('tr');

                // Format timestamp if it exists, otherwise use date/time strings (backward compatibility)
                const dateDisplay = record.date || (record.timestamp ? new Date(record.timestamp.seconds * 1000).toLocaleDateString() : 'N/A');
                const timeDisplay = record.time || (record.timestamp ? new Date(record.timestamp.seconds * 1000).toLocaleTimeString() : 'N/A');

                row.innerHTML = `
                    <td>${record.name}</td>
                    <td>${dateDisplay}</td>
                    <td>${timeDisplay}</td>
                `;
                attendanceTableBody.appendChild(row);
            });
        }, (error) => {
            console.error("Error getting documents: ", error);
            attendanceTableBody.innerHTML = `<tr><td colspan="3" style="color:red; text-align:center;">Error loading data: ${error.message}</td></tr>`;
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
=======
document.addEventListener('DOMContentLoaded', () => {
    const attendanceForm = document.getElementById('attendanceForm');
    const attendanceTableBody = document.querySelector('#attendanceTable tbody');
    const clearBtn = document.getElementById('clearBtn');

    // Load attendance from local storage using a specific key for this app
    const STORAGE_KEY = 'attendance_app_data';
    let attendanceData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Function to render the table
    const renderTable = () => {
        attendanceTableBody.innerHTML = '';
        if (attendanceData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3" style="text-align:center;">No records found</td>`;
            attendanceTableBody.appendChild(row);
            return;
        }

        // Sort by date/time descending (newest first)
        const sortedData = [...attendanceData].reverse();

        sortedData.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.date}</td>
                <td>${record.time}</td>
            `;
            attendanceTableBody.appendChild(row);
        });
    };

    // Initial render
    renderTable();

    // Handle form submission
    attendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim();

        if (name) {
            const now = new Date();
            const newRecord = {
                name: name,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                timestamp: now.getTime() // Useful for sorting if needed later
            };

            attendanceData.push(newRecord);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceData));
            
            nameInput.value = ''; // Clear input
            renderTable();
            alert(`Attendance marked for ${name}!`);
        }
    });

    // Handle clear logs
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all attendance records?')) {
            attendanceData = [];
            localStorage.removeItem(STORAGE_KEY);
            renderTable();
        }
    });
});
>>>>>>> 7c8564dac7e5d10c66d6cb72ec1c93b50cfceff6
