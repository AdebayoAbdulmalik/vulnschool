
const courseListEl = document.getElementById('course-list');
const courseErrorEl = document.getElementById('course-error');
const roleBadgeEl = document.getElementById('role-badge');
const adminLinkEl = document.getElementById('admin-link');
const logoutBtn = document.getElementById('logout-btn');


const role = localStorage.getItem('role');
if (role) {
    roleBadgeEl.textContent = role;
}
if (role === 'admin' || role === 'super_admin') {
    adminLinkEl.style.display = 'inline';
}

logoutBtn.addEventListener('click', () => {
   
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
});

// Fetch and render every course on the dashboard
async function loadCourses() {
    const data = await apiRequest('GET', '/courses', null, false);

    if (data._status !== 200) {
        courseErrorEl.textContent = data.message || 'Failed to load courses';
        courseErrorEl.style.display = 'block';
        return;
    }

    courseListEl.innerHTML = '';

    data.data.forEach((course) => {
        const isFull = course.enrolledStudents.length >= course.capacity;

        const row = document.createElement('div');
        row.className = 'course-row';

       
        row.innerHTML = `
            <div>
                <p class="course-title">${course.title}</p>
                <p class="course-meta">${course.code} · ${course.enrolledStudents.length}/${course.capacity} enrolled</p>
            </div>
        `;

        if (isFull) {
            const pill = document.createElement('span');
            pill.className = 'status-pill status-full';
            pill.textContent = 'Full';
            row.appendChild(pill);
        } else {
            const btn = document.createElement('button');
            btn.className = 'course-action-btn';
            btn.textContent = 'Register';
            btn.addEventListener('click', () => registerForCourse(course._id));
            row.appendChild(btn);
        }

        courseListEl.appendChild(row);
    });
}


async function registerForCourse(courseId) {
   
    const token = localStorage.getItem('token');
    if (!token) {
        courseErrorEl.textContent = 'You must be logged in to register for a course';
        courseErrorEl.style.display = 'block';
        return;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    const data = await apiRequest('POST', `/courses/${courseId}/register`, { userId }, true);

    if (data._status === 200) {
        loadCourses();
    } else {
        courseErrorEl.textContent = data.message || 'Failed to register for course';
        courseErrorEl.style.display = 'block';
    }
}

loadCourses();