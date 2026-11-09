(function () {
  const path = window.location.pathname.replace(/\/$/, '').toLowerCase() || '/';
  if (path === '/soc') return; // SOC has its own login, no tab bar there

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  let tabs;
  if (token) {
    tabs = [
      { href: '/dashboard', icon: 'fa-book-open', label: 'Courses' },
      { href: '/results', icon: 'fa-chart-simple', label: 'Results' },
      { href: '/profile', icon: 'fa-user', label: 'Profile' }
    ];
    if (role === 'admin' || role === 'super_admin') {
      tabs.push({ href: '/admin', icon: 'fa-user-shield', label: 'Admin' });
    }
    if (role === 'super_admin') {
      tabs.push({ href: '/superadmin', icon: 'fa-crown', label: 'Super' });
    }
  } else {
    tabs = [
      { href: '/', icon: 'fa-house', label: 'Home' },
      { href: '/About', icon: 'fa-circle-info', label: 'About' },
      { href: '/Contact', icon: 'fa-envelope', label: 'Contact' },
      { href: '/login', icon: 'fa-right-to-bracket', label: 'Log In' }
    ];
  }

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';

  tabs.forEach(t => {
    const a = document.createElement('a');
    a.href = t.href;
    const isActive =
      path === t.href.toLowerCase() ||
      (t.href === '/login' && path === '/register');
    if (isActive) a.classList.add('active');
    a.innerHTML = `<i class="fa-solid ${t.icon}"></i><span>${t.label}</span>`;
    nav.appendChild(a);
  });

  document.body.appendChild(nav);
  document.body.classList.add('has-bottom-nav');
})();
