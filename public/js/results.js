

const resultListEl = document.getElementById('result-list');
const resultErrorEl = document.getElementById('result-error');
const roleBadgeEl = document.getElementById('role-badge');
const adminLinkEl = document.getElementById('admin-link');
const logoutBtn = document.getElementById('logout-btn');

const role = localStorage.getItem('role');
if (role) roleBadgeEl.textContent = role;
if (role === 'admin' || role === 'super_admin') {
    adminLinkEl.style.display = 'inline';
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
});

function getOwnUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}

async function loadResults() {
    const userId = getOwnUserId();
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const data = await apiRequest('GET', `/results/student/${userId}`, null, true);

    if (data._status !== 200) {
        resultErrorEl.textContent = data.message || 'Failed to load results';
        resultErrorEl.style.display = 'block';
        return;
    }

    if (data.data.length === 0) {
        resultListEl.innerHTML = '<p style="color:#6b6b6b; font-size:14px;">No results found yet.</p>';
        return;
    }

    resultListEl.innerHTML = '';

    data.data.forEach((result) => {
        const row = document.createElement('div');
        row.className = 'course-row';

        row.innerHTML = `
            <div>
                <p class="course-title">${result.course ? result.course.title : 'Unknown course'}</p>
                <p class="course-meta">
                    ${result.course ? result.course.code : ''} ·
                    Grade: ${result.grade || 'Not graded'} ·
                    Score: ${result.score !== undefined ? result.score : 'N/A'} ·
                    Attendance: ${result.attendance ?? 0}%
                </p>
            </div>
        `;

        resultListEl.appendChild(row);
    });
}

loadResults();