
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
    window.location.href = '/login';
});

// Get logged-in user's ID from token
function getCurrentUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}

async function loadCourses() {
    const data = await apiRequest('GET', '/courses', null, false);

    if (data._status !== 200) {
        courseErrorEl.textContent = data.message || 'Failed to load courses';
        courseErrorEl.style.display = 'block';
        return;
    }

    courseListEl.innerHTML = '';
    const currentUserId = getCurrentUserId();

    data.data.forEach((course) => {
        const isFull = course.enrolledStudents.length >= course.capacity;

        // Check if current user is already enrolled
        const isEnrolled = course.enrolledStudents
            .map(id => id.toString())
            .includes(currentUserId);

        const row = document.createElement('div');
        row.className = 'course-row';

        row.innerHTML = `
            <div>
                <p class="course-title">${course.title}</p>
                <p class="course-meta">${course.code} · ${course.enrolledStudents.length}/${course.capacity} enrolled</p>
            </div>
        `;

        if (isEnrolled) {
            // Already enrolled — show pill + drop button
            const pill = document.createElement('span');
            pill.className = 'status-pill status-open';
            pill.textContent = 'Enrolled';
            row.appendChild(pill);

            const dropBtn = document.createElement('button');
            dropBtn.className = 'course-action-btn';
            dropBtn.style.marginLeft = '8px';
            dropBtn.textContent = 'Drop';
            dropBtn.addEventListener('click', async () => {
                dropBtn.textContent = 'Dropping...';
                dropBtn.disabled = true;
                await dropCourse(course._id, currentUserId);
            });
            row.appendChild(dropBtn);

        } else if (isFull) {
            // Course is full
            const pill = document.createElement('span');
            pill.className = 'status-pill status-full';
            pill.textContent = 'Full';
            row.appendChild(pill);

        } else {
            // Not enrolled, not full — show register button
            const btn = document.createElement('button');
            btn.className = 'course-action-btn';
            btn.textContent = 'Register';
            btn.addEventListener('click', async () => {
                btn.textContent = 'Registering...';
                btn.disabled = true;
                await registerForCourse(course._id);
                btn.textContent = 'Register';
                btn.disabled = false;
            });
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
    const userId = getCurrentUserId();

    const data = await apiRequest('POST', `/courses/${courseId}/register`, { userId }, true);

    if (data._status === 200) {
        courseErrorEl.style.color = '#27500A';
        courseErrorEl.style.background = '#EAF3DE';
        courseErrorEl.textContent = 'Successfully registered for course!';
        courseErrorEl.style.display = 'block';
        setTimeout(() => {
            courseErrorEl.style.display = 'none';
            loadCourses();
        }, 1500);
    } else {
        courseErrorEl.style.color = '#b3261e';
        courseErrorEl.style.background = '';
        courseErrorEl.textContent = data.message || 'Failed to register for course';
        courseErrorEl.style.display = 'block';
    }
}

async function dropCourse(courseId, userId) {
    const data = await apiRequest('POST', `/courses/${courseId}/drop`, { userId }, true);

    if (data._status === 200) {
        courseErrorEl.style.color = '#27500A';
        courseErrorEl.style.background = '#EAF3DE';
        courseErrorEl.textContent = 'Dropped from course successfully';
        courseErrorEl.style.display = 'block';
        setTimeout(() => {
            courseErrorEl.style.display = 'none';
            loadCourses();
        }, 1500);
    } else {
        courseErrorEl.style.color = '#b3261e';
        courseErrorEl.style.background = '';
        courseErrorEl.textContent = data.message || 'Failed to drop course';
        courseErrorEl.style.display = 'block';
    }
}

loadCourses();