
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const bioInput = document.getElementById('bio');
const websiteInput = document.getElementById('website');
const roleInput = document.getElementById('role');
const errorEl = document.getElementById('profile-error');
const saveBtn = document.getElementById('save-btn');
const adminLinkEl = document.getElementById('admin-link');
const logoutBtn = document.getElementById('logout-btn');
const picInput = document.getElementById('pic-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadMsg = document.getElementById('upload-msg');
const profilePic = document.getElementById('profile-pic');

const role = localStorage.getItem('role');
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

async function loadProfile() {
    const userId = getOwnUserId();
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const data = await apiRequest('GET', `/students/${userId}`, null, true);

    if (data._status !== 200) {
        errorEl.textContent = data.message || 'Failed to load profile';
        errorEl.style.display = 'block';
        return;
    }

    nameInput.value = data.data.name;
    emailInput.value = data.data.email;
    bioInput.value = data.data.bio || '';
    websiteInput.value = data.data.website || '';
    roleInput.value = data.data.role;


    if (data.data.profilePicture) {
        profilePic.src = `/api/upload/file?name=${data.data.profilePicture}`;
        profilePic.style.display = 'block';
    }
}


saveBtn.addEventListener('click', async () => {
    const userId = getOwnUserId();

    const data = await apiRequest('PUT', `/students/${userId}`, {
        name: nameInput.value,
        email: emailInput.value,
        bio: bioInput.value,
        website: websiteInput.value
    }, true);

    if (data._status === 200) {
        errorEl.style.display = 'none';
        saveBtn.textContent = 'Saved';
        setTimeout(() => { saveBtn.textContent = 'Save changes'; }, 1500);
    } else {
        errorEl.textContent = data.message || 'Failed to save changes';
        errorEl.style.display = 'block';
    }
});


uploadBtn.addEventListener('click', async () => {
    const file = picInput.files[0];
    if (!file) {
        uploadMsg.textContent = 'Please select a file first';
        uploadMsg.style.display = 'block';
        return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('picture', file);

    const response = await fetch(window.location.origin + '/api/upload/profile-picture', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    });

    const data = await response.json();

    if (response.ok) {
       
        uploadMsg.textContent = `Uploaded: ${data.path}`;
        uploadMsg.style.display = 'block';
        profilePic.src = `/api/upload/file?name=${data.filename}`;
        profilePic.style.display = 'block';
    } else {
        uploadMsg.textContent = data.message || 'Upload failed';
        uploadMsg.style.display = 'block';
    }
});

loadProfile();
