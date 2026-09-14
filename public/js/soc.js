const socLoginEl = document.getElementById('soc-login');
const socDashboardEl = document.getElementById('soc-dashboard');
const socLoginBtn = document.getElementById('soc-login-btn');
const socPasswordInput = document.getElementById('soc-password-input');
const socLoginError = document.getElementById('soc-login-error');
const refreshBtn = document.getElementById('refresh-btn');
const logoutSoc = document.getElementById('logout-soc');

let socPassword = sessionStorage.getItem('soc_password') || null;
let autoRefreshInterval = null;

if (socPassword) {
    showDashboard();
} else {
    socLoginEl.style.display = 'block';
}

socLoginBtn.addEventListener('click', async () => {
    const pwd = socPasswordInput.value;
    if (!pwd) return;

    const res = await fetch(window.location.origin + '/api/logs', {
        headers: { 'x-soc-password': pwd }
    });

    if (res.ok) {
        sessionStorage.setItem('soc_password', pwd);
        socPassword = pwd;
        socLoginEl.style.display = 'none';
        showDashboard();
    } else {
        socLoginError.textContent = 'Invalid SOC password';
        socLoginError.style.display = 'block';
    }
});

logoutSoc.addEventListener('click', () => {
    sessionStorage.removeItem('soc_password');
    clearInterval(autoRefreshInterval);
    socDashboardEl.style.display = 'none';
    socLoginEl.style.display = 'block';
    socPasswordInput.value = '';
});

refreshBtn.addEventListener('click', loadData);

function showDashboard() {
    socDashboardEl.style.display = 'block';
    loadData();
    autoRefreshInterval = setInterval(loadData, 15000);
}

async function loadData() {
    try {
        const res = await fetch(window.location.origin + '/api/logs', {
            headers: { 'x-soc-password': socPassword }
        });

        if (!res.ok) {
            sessionStorage.removeItem('soc_password');
            location.reload();
            return;
        }

        const data = await res.json();
        renderStats(data.stats);
        renderAlerts(data.alerts);
        renderRecent(data.recent);
        renderTopEndpoints(data.stats.topEndpoints);
        renderTopIPs(data.stats.topIPs, data.stats.bruteForceIPs);

    } catch (err) {
        console.error('Failed to load SOC data:', err);
    }
}

function renderStats(stats) {
    document.getElementById('stat-total').textContent = stats.totalRequests;
    document.getElementById('stat-ips').textContent = stats.uniqueIPs;
    document.getElementById('stat-alerts').textContent = stats.totalAlerts;
    document.getElementById('stat-brute').textContent = stats.bruteForceIPs.length;
}

// Build an expandable row — click the row to show/hide full payload
function buildExpandableRow(entry, isAlert) {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '8px';

    const row = document.createElement('div');
    row.className = isAlert ? 'alert-row high' : 'log-row';
    row.style.cursor = 'pointer';

    const statusClass = entry.statusCode < 300 ? 'status-ok' :
                       entry.statusCode < 500 ? 'status-warn' : 'status-err';

    row.innerHTML = `
        <div style="flex:1;">
            <div>
                <span class="alert-method">${entry.method}</span>
                <span class="alert-path">${entry.path}</span>
                ${entry.alert ? '<span class="threat-pill" style="margin-left:8px;">⚠ Alert</span>' : ''}
            </div>
            <div class="alert-meta" style="margin-top:4px;">
                IP: <strong>${entry.ip}</strong> ·
                User: ${entry.userId || 'unauthenticated'} ·
                Role: ${entry.role || '—'} ·
                <span class="${statusClass}">HTTP ${entry.statusCode}</span> ·
                ${entry.responseTime} ·
                ${entry.timestamp}
            </div>
            ${entry.threats && entry.threats.length > 0 ? `
                <div style="margin-top:6px;">
                    ${entry.threats.map(t => `<span class="threat-pill">${t}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div style="color:#6b6b6b;font-size:13px;margin-left:12px;">▼</div>
    `;

   
    const detail = document.createElement('div');
    detail.style.cssText = 'display:none;background:#f7f6f3;border:0.5px solid #e5e3dc;border-top:none;border-radius:0 0 8px 8px;padding:12px 16px;font-size:12px;font-family:monospace;';

    const bodyStr = JSON.stringify(entry.body || {}, null, 2);
    const queryStr = JSON.stringify(entry.query || {}, null, 2);
    const uaStr = entry.userAgent || '—';

    detail.innerHTML = `
        <p style="font-weight:600;margin-bottom:6px;font-family:sans-serif;">Request payload</p>
        <p style="color:#6b6b6b;margin-bottom:4px;">Body:</p>
        <pre style="background:#1D3A5F;color:#C6942A;padding:8px;border-radius:4px;overflow-x:auto;">${escapeHtml(bodyStr)}</pre>
        <p style="color:#6b6b6b;margin:8px 0 4px;">Query params:</p>
        <pre style="background:#1D3A5F;color:#C6942A;padding:8px;border-radius:4px;overflow-x:auto;">${escapeHtml(queryStr)}</pre>
        <p style="color:#6b6b6b;margin:8px 0 4px;">User agent:</p>
        <p style="background:#1D3A5F;color:#C6942A;padding:8px;border-radius:4px;">${escapeHtml(uaStr)}</p>
    `;

   
    let expanded = false;
    row.addEventListener('click', () => {
        expanded = !expanded;
        detail.style.display = expanded ? 'block' : 'none';
        row.querySelector('div:last-child').textContent = expanded ? '▲' : '▼';
        if (expanded) {
            row.style.borderRadius = '8px 8px 0 0';
        } else {
            row.style.borderRadius = '';
        }
    });

    wrapper.appendChild(row);
    wrapper.appendChild(detail);
    return wrapper;
}


function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderAlerts(alerts) {
    const el = document.getElementById('alert-list');
    document.getElementById('alert-count').textContent = `(${alerts.length})`;

    if (alerts.length === 0) {
        el.innerHTML = '<p style="font-size:13px;color:#6b6b6b;">No alerts yet.</p>';
        return;
    }

    el.innerHTML = '';
    [...alerts].reverse().forEach(a => {
        el.appendChild(buildExpandableRow(a, true));
    });
}

function renderRecent(entries) {
    const el = document.getElementById('recent-list');

    if (!entries || entries.length === 0) {
        el.innerHTML = '<p style="font-size:13px;color:#6b6b6b;">No requests yet.</p>';
        return;
    }

    el.innerHTML = '';
    [...entries].reverse().forEach(e => {
        el.appendChild(buildExpandableRow(e, false));
    });
}

function renderTopEndpoints(endpoints) {
    const el = document.getElementById('top-endpoints');
    if (!endpoints || endpoints.length === 0) {
        el.innerHTML = '<p style="font-size:13px;color:#6b6b6b;">No data yet.</p>';
        return;
    }
    el.innerHTML = endpoints.map(e => `
        <div class="ip-row">
            <span style="font-size:12px;font-family:monospace;">${e.endpoint}</span>
            <span class="ip-count">${e.count}</span>
        </div>
    `).join('');
}

function renderTopIPs(ips, bruteForceIPs) {
    const el = document.getElementById('top-ips');
    const bruteSet = new Set((bruteForceIPs || []).map(b => b.ip));

    if (!ips || ips.length === 0) {
        el.innerHTML = '<p style="font-size:13px;color:#6b6b6b;">No data yet.</p>';
        return;
    }

    el.innerHTML = ips.map(i => `
        <div class="ip-row">
            <span>${i.ip} ${bruteSet.has(i.ip) ? '<span class="ip-brute">⚠ Brute force</span>' : ''}</span>
            <span class="ip-count">${i.count}</span>
        </div>
    `).join('');
}