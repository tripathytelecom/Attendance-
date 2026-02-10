document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const authLinks = document.getElementById('authLinks');
    const userLinks = document.getElementById('userLinks');
    const userEmailDisplay = document.getElementById('userEmailDisplay'); // Will rename this logically in finding, but keeping ID for compatibility unless we change index.html
    const landingPage = document.getElementById('landingPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const logoutBtn = document.getElementById('logoutBtn');

    // Form Elements
    const attendanceForm = document.getElementById('attendanceForm');
    const attendanceTableBody = document.querySelector('#attendanceTable tbody');

    // --- MOCK AUTHENTICATION (LocalStorage) ---
    const STORAGE_KEY_USER = 'attendance_current_user';
    const STORAGE_KEY_DATA = 'attendance_records';

    // Check if user is logged in
    const getCurrentUser = () => {
        const userJson = localStorage.getItem(STORAGE_KEY_USER);
        return userJson ? JSON.parse(userJson) : null;
    };

    // Logout Function
    const logout = () => {
        localStorage.removeItem(STORAGE_KEY_USER);
        window.location.href = 'index.html';
    };

    // --- VIEW LOGIC ---
    const toggleView = () => {
        const user = getCurrentUser();
        // Update the display to show Name if available, check ID existence first
        if (userEmailDisplay && user) {
            userEmailDisplay.textContent = `Welcome, ${user.name || user.mobile}`;
        }

        if (user) {
            // User is logged in
            if (landingPage) landingPage.style.display = 'none';
            if (dashboardPage) dashboardPage.style.display = 'block';
            if (authLinks) authLinks.style.display = 'none';
            if (userLinks) userLinks.style.display = 'flex';

            loadAttendanceData(); // Load data
        } else {
            // User is logged out
            if (landingPage) landingPage.style.display = 'flex';
            if (dashboardPage) dashboardPage.style.display = 'none';
            if (authLinks) authLinks.style.display = 'flex';
            if (userLinks) userLinks.style.display = 'none';
            if (attendanceTableBody) attendanceTableBody.innerHTML = ''; // Clear table
        }
    };

    // Initialize View
    toggleView();

    // Logout Event Listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // --- DATA LOGIC (LocalStorage) ---

    // Load Attendance Data
    function loadAttendanceData() {
        const user = getCurrentUser();
        if (!user) return;

        const allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY_DATA)) || [];

        // Filter records for current user
        // We use user.uid to link records
        const userRecords = allRecords.filter(record => record.userId === user.uid);

        // Sort by timestamp descending
        userRecords.sort((a, b) => b.timestamp - a.timestamp);

        renderTable(userRecords);
    }

    // Render Table
    function renderTable(records) {
        if (!attendanceTableBody) return;
        attendanceTableBody.innerHTML = '';

        if (records.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" style="text-align:center;">No records found. Mark your attendance above!</td>`;
            attendanceTableBody.appendChild(row);
            return;
        }

        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.date}</td>
                <td>${record.time}</td>
                <td><button class="delete-btn" data-id="${record.id}" style="background-color: var(--danger-color); color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-size: 0.9rem;">Delete</button></td>
            `;
            attendanceTableBody.appendChild(row);
        });

        // Add Delete Event Listeners
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteRecord(id);
            });
        });
    }

    // Add Record
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = getCurrentUser();
            if (!user) {
                alert("You must be logged in.");
                return;
            }

            const nameInput = document.getElementById('name');
            const name = nameInput.value.trim();

            if (name) {
                const now = new Date();
                const newRecord = {
                    id: Date.now().toString(),
                    name: name,
                    date: now.toLocaleDateString(),
                    time: now.toLocaleTimeString(),
                    timestamp: now.getTime(),
                    userId: user.uid,
                    userEmail: user.email // Keep for legacy, though we use uid
                };

                // Save to LocalStorage
                const allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY_DATA)) || [];
                allRecords.push(newRecord);
                localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(allRecords));

                nameInput.value = '';
                // No alert needed if we update UI immediately, but user might want confirmation
                // alert(`Attendance marked for ${name}!`); 
                loadAttendanceData(); // Refresh table
            }
        });
    }

    // Delete Record
    function deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            let allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY_DATA)) || [];
            allRecords = allRecords.filter(record => record.id !== id);
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(allRecords));
            loadAttendanceData(); // Refresh table
        }
    }
});
