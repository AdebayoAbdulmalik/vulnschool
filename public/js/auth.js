

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');


if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');

        
        const data = await apiRequest('POST', '/auth/login', { email, password }, false);

        if (data._status === 200 && data.token) {
          
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
             errorEl.style.color = '#27500A';
            errorEl.style.background = '#EAF3DE';
            errorEl.style.border = '0.5px solid #c3e6a0';
            errorEl.textContent = 'Login successful! Redirecting...';
            errorEl.style.display = 'block';

            setTimeout(() => { window.location.href = '/dashboard'; }, 1000);

            
           
        } else {
            
            errorEl.textContent = data.message || 'Login failed';
            errorEl.style.display = 'block';
        }
    });
}

// ---- REGISTER ----
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('register-error');

        const data = await apiRequest('POST', '/auth/register', { name, email, password }, false);

        if (data._status === 201) {
            errorEl.style.color = '#27500A';
            errorEl.style.background = '#EAF3DE';
            errorEl.style.border = '0.5px solid #c3e6a0';
            errorEl.textContent = 'Account created! Redirecting to login...';
            errorEl.style.display = 'block';

            setTimeout(() => { window.location.href = '/login'; }, 1500);
        } else {
            errorEl.textContent = data.message || 'Registration failed';
            errorEl.style.display = 'block';
        }
    });
}