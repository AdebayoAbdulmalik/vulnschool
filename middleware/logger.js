const fs = require('fs');
const path = require('path');

// Ensure logs/ directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, 'access.log');

// Fields to redact from request bodies before logging —
// we never want plaintext passwords in the log file
const REDACTED_FIELDS = ['password', 'confirmPassword'];

function redactBody(body) {
    if (!body || typeof body !== 'object') return body;
    const clean = { ...body };
    REDACTED_FIELDS.forEach(field => {
        if (clean[field]) clean[field] = '[REDACTED]';
    });
    return clean;
}

// Detection rules — these flag suspicious patterns in the log
// so your friend's SOC dashboard can highlight them as alerts
function detectThreats(entry) {
    const threats = [];
    const bodyStr = JSON.stringify(entry.body || {}).toLowerCase();
    const queryStr = JSON.stringify(entry.query || {}).toLowerCase();
    const pathStr = entry.path.toLowerCase();

    // NoSQL injection — Mongo operators in body
    if (bodyStr.includes('$ne') || bodyStr.includes('$gt') ||
        bodyStr.includes('$lt') || bodyStr.includes('$where') ||
        bodyStr.includes('$regex')) {
        threats.push('NOSQL_INJECTION');
    }

    // XSS payload in body
    if (bodyStr.includes('<script') || bodyStr.includes('onerror=') ||
        bodyStr.includes('onload=') || bodyStr.includes('javascript:')) {
        threats.push('XSS_PAYLOAD');
    }

    // Path traversal in query params
    if (queryStr.includes('../') || queryStr.includes('..\\') ||
        queryStr.includes('%2e%2e')) {
        threats.push('PATH_TRAVERSAL');
    }

    // SSRF attempt — internal URLs in body
    if (bodyStr.includes('localhost') || bodyStr.includes('127.0.0.1') ||
        bodyStr.includes('169.254') || bodyStr.includes('192.168.')) {
        threats.push('SSRF_ATTEMPT');
    }

    // Mass assignment — role field in PUT body
    if (entry.method === 'PUT' && bodyStr.includes('"role"')) {
        threats.push('MASS_ASSIGNMENT');
    }

    // Brute force signal — failed login
    if (pathStr.includes('/auth/login') && entry.statusCode === 401) {
        threats.push('FAILED_LOGIN');
    }

    // Broken access control probe — 403 on any route
    if (entry.statusCode === 403) {
        threats.push('ACCESS_CONTROL_PROBE');
    }

    return threats;
}

function logger(req, res, next) {
    const start = Date.now();

    // Run after the response is sent so we can log the status code
    res.on('finish', () => {
        // Try to get user identity from JWT payload if auth middleware
        // already ran and attached req.user
        const userId = req.user ? req.user.userId : null;
        const role = req.user ? req.user.role : null;

        const entry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            ip: req.ip || req.connection.remoteAddress,
            userId,
            role,
            statusCode: res.statusCode,
            responseTime: `${Date.now() - start}ms`,
            body: redactBody(req.body),
            query: req.query,
            userAgent: req.headers['user-agent'] || ''
        };

        // Run threat detection on this entry
        const threats = detectThreats(entry);
        if (threats.length > 0) {
            entry.threats = threats;
            entry.alert = true;
        }

        // Write one JSON line per request to the log file
        fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    });

    next();
}

module.exports = logger;