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
