
const totalStudentsEl = document.getElementById('total-students');
const totalAdminsEl = document.getElementById('total-admins');
const totalUsersEl = document.getElementById('total-users');
const userListEl = document.getElementById('user-list');
const promoteError = document.getElementById('promote-error');
const promoteSuccess = document.getElementById('promote-success');
const logoutBtn = document.getElementById('logout-btn');
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token) {
    window.location.href = 'login';
}

if (role !== 'super_admin') {
    window.location.href = 'login';
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
});

async function loadUsers() {
    const data = await apiRequest('GET', '/students', null, false);
    if (data._status !== 200) return;

    const users = data.data;

    // Count by role
    const students = users.filter(u => u.role === 'student');
    const admins = users.filter(u => u.role === 'admin');

    totalStudentsEl.textContent = students.length;
    totalAdminsEl.textContent = admins.length;
    totalUsersEl.textContent = users.length;

    userListEl.innerHTML = '';

    // Group by role
    const grouped = { super_admin: [], admin: [], student: [] };
    users.forEach(u => {
        if (grouped[u.role]) grouped[u.role].push(u);
        else grouped.student.push(u);
    });

    Object.entries(grouped).forEach(([role, roleUsers]) => {
        if (roleUsers.length === 0) return;

        const header = document.createElement('p');
        header.style.cssText = 'font-size:12px;font-weight:600;color:#6b6b6b;margin:1rem 0 0.5rem;text-transform:uppercase;letter-spacing:0.08em;';
        header.textContent = `${role} (${roleUsers.length})`;
        userListEl.appendChild(header);

        roleUsers.forEach(user => {
            const row = document.createElement('div');
            row.className = 'course-row';

            row.innerHTML = `
                <div>
                    <p class="course-title">${user.name}</p>
                    <p class="course-meta">${user.email} · ${user.role}</p>
                    <p class="course-meta" style="font-size:11px;color:#999;margin-top:2px;">ID: ${user._id}</p>
                </div>
            `;

            // Promote/demote buttons — not for super_admin
            if (role !== 'super_admin') {
                const toggleRole = role === 'admin' ? 'student' : 'admin';
                const btn = document.createElement('button');
                btn.className = 'course-action-btn';
                btn.textContent = role === 'admin' ? 'Demote' : 'Promote';
                btn.addEventListener('click', async () => {
                    const res = await apiRequest('PUT', `/students/${user._id}/promote`, { role: toggleRole }, true);
                    if (res._status === 200) {
                        promoteSuccess.textContent = `${user.name} updated to ${toggleRole}`;
                        promoteSuccess.style.display = 'block';
                        promoteError.style.display = 'none';
                        loadUsers();
                    } else {
                        promoteError.textContent = res.message || 'Failed to update role';
                        promoteError.style.display = 'block';
                        promoteSuccess.style.display = 'none';
                    }
                });
                row.appendChild(btn);
            }

            userListEl.appendChild(row);
        });
    });
}

loadUsers();