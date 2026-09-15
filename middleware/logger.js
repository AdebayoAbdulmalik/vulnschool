const fs = require('fs');
const path = require('path');


const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, 'access.log');


const REDACTED_FIELDS = ['password', 'confirmPassword'];

function redactBody(body) {
    if (!body || typeof body !== 'object') return body;
    const clean = { ...body };
    REDACTED_FIELDS.forEach(field => {
        if (clean[field]) clean[field] = '[REDACTED]';
    });
    return clean;
}


function detectThreats(entry) {
    const threats = [];
    const bodyStr = JSON.stringify(entry.body || {}).toLowerCase();
    const queryStr = JSON.stringify(entry.query || {}).toLowerCase();
    const pathStr = entry.path.toLowerCase();

  
    if (bodyStr.includes('$ne') || bodyStr.includes('$gt') ||
        bodyStr.includes('$lt') || bodyStr.includes('$where') ||
        bodyStr.includes('$regex')) {
        threats.push('NOSQL_INJECTION');
    }

   
    if (bodyStr.includes('<script') || bodyStr.includes('onerror=') ||
        bodyStr.includes('onload=') || bodyStr.includes('javascript:')) {
        threats.push('XSS_PAYLOAD');
    }

    
    if (queryStr.includes('../') || queryStr.includes('..\\') ||
        queryStr.includes('%2e%2e')) {
        threats.push('PATH_TRAVERSAL');
    }

    
    if (bodyStr.includes('localhost') || bodyStr.includes('127.0.0.1') ||
        bodyStr.includes('169.254') || bodyStr.includes('192.168.')) {
        threats.push('SSRF_ATTEMPT');
    }

    
    if (entry.method === 'PUT' && bodyStr.includes('"role"')) {
        threats.push('MASS_ASSIGNMENT');
    }

    
    if (pathStr.includes('/auth/login') && entry.statusCode === 401) {
        threats.push('FAILED_LOGIN');
    }

   
    if (entry.statusCode === 403) {
        threats.push('ACCESS_CONTROL_PROBE');
    }

    return threats;
}

function logger(req, res, next) {
    const start = Date.now();

   
    res.on('finish', () => {
       
        const userId = req.user ? req.user.userId : null;
        const role = req.user ? req.user.role : null;

        const entry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            ip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection.remoteAddress,
            userId,
            role,
            statusCode: res.statusCode,
            responseTime: `${Date.now() - start}ms`,
            body: redactBody(req.body),
            query: req.query,
            userAgent: req.headers['user-agent'] || ''
        };

        
        const threats = detectThreats(entry);
        if (threats.length > 0) {
            entry.threats = threats;
            entry.alert = true;
        }

        fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    });

    next();
}

module.exports = logger;