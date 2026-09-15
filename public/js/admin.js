

const createBtn = document.getElementById('create-btn');
const createErrorEl = document.getElementById('create-error');
const courseListEl = document.getElementById('admin-course-list');
const studentListEl = document.getElementById('admin-student-list');
const assignResultBtn = document.getElementById('assign-result-btn');
const resultErrorEl = document.getElementById('result-error');
const logoutBtn = document.getElementById('logout-btn');
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token) {
    window.location.href = 'login';
}

if (role !== 'admin' && role !== 'super_admin') {
    window.location.href = 'login';
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login';
});


createBtn.addEventListener('click', async () => {
    const title = document.getElementById('c-title').value;
    const code = document.getElementById('c-code').value;
    const semester = document.getElementById('c-semester').value;
    const capacity = Number(document.getElementById('c-capacity').value);

    const data = await apiRequest('POST', '/courses', { title, code, semester, capacity }, true);

    if (data._status === 201) {
        createErrorEl.style.display = 'none';
        document.getElementById('c-title').value = '';
        document.getElementById('c-code').value = '';
        document.getElementById('c-semester').value = '';
        document.getElementById('c-capacity').value = '';
        loadCourses();
    } else {
        createErrorEl.textContent = data.message || 'Failed to create course';
        createErrorEl.style.display = 'block';
    }
});


assignResultBtn.addEventListener('click', async () => {
    const student = document.getElementById('r-student').value;
    const course = document.getElementById('r-course').value;
    const grade = document.getElementById('r-grade').value;
    const score = Number(document.getElementById('r-score').value);
    const attendance = Number(document.getElementById('r-attendance').value);
    const semester = document.getElementById('r-semester').value;

    const data = await apiRequest('POST', '/results', {
        student, course, grade, score, attendance, semester
    }, true);

    if (data._status === 201) {
        resultErrorEl.style.display = 'none';
        document.getElementById('r-student').value = '';
        document.getElementById('r-course').value = '';
        document.getElementById('r-grade').value = '';
        document.getElementById('r-score').value = '';
        document.getElementById('r-attendance').value = '';
        document.getElementById('r-semester').value = '';
    } else {
        resultErrorEl.textContent = data.message || 'Failed to assign result';
        resultErrorEl.style.display = 'block';
    }
});


async function loadCourses() {
    const data = await apiRequest('GET', '/courses', null, false);
    if (data._status !== 200) return;

    courseListEl.innerHTML = '';

    data.data.forEach((course) => {
        const row = document.createElement('div');
        row.className = 'course-row';


        row.innerHTML = `
            <div>
                <p class="course-title">${course.title}</p>
                <p class="course-meta">
                    ${course.code} ·
                    ${course.semester} ·
                    ${course.enrolledStudents.length}/${course.capacity} enrolled
                </p>
                <p class="course-meta" style="font-size:11px; margin-top:2px; color:#999;">
                    ID: ${course._id}
                </p>
            </div>
        `;

        const delBtn = document.createElement('button');
        delBtn.className = 'course-action-btn';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', async () => {
            const res = await apiRequest('DELETE', `/courses/${course._id}`, null, true);
            if (res._status === 200) loadCourses();
        });
        row.appendChild(delBtn);
        courseListEl.appendChild(row);
    });
}


async function loadStudents() {
    const data = await apiRequest('GET', '/students', null, false);
    if (data._status !== 200) return;

    studentListEl.innerHTML = '';

    data.data.forEach((student) => {
        const row = document.createElement('div');
        row.className = 'course-row';

        
        row.innerHTML = `
            <div>
                <p class="course-title">${student.name}</p>
                <p class="course-meta">${student.email} · ${student.role}</p>
                <p class="course-meta" style="font-size:11px; margin-top:2px; color:#999;">
                    ID: ${student._id}
                </p>
            </div>
        `;

        studentListEl.appendChild(row);
    });
}

loadCourses();
loadStudents();