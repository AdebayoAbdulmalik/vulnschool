const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/access.log');

// Simple password protection for the SOC dashboard —
// separate from the student portal JWT auth system.
// Set SOC_PASSWORD in your .env.student file.
function socAuth(req, res, next) {
    const password = req.headers['x-soc-password'];
    if (!password || password !== process.env.SOC_PASSWORD) {
        return res.status(401).json({ message: 'Invalid SOC password' });
    }
    next();
}

// Read and parse the log file into an array of entries
function readLogs() {
    if (!fs.existsSync(logFile)) return [];
    const lines = fs.readFileSync(logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim());
    return lines.map(line => {
        try { return JSON.parse(line); }
        catch { return null; }
    }).filter(Boolean);
}

// GET /api/logs — return all log entries with stats and alerts
router.get('/', socAuth, (req, res) => {
    try {
        const entries = readLogs();

        // Separate alerts from normal entries
        const alerts = entries.filter(e => e.alert);

        // Stats
        const uniqueIPs = [...new Set(entries.map(e => e.ip))];
        const statusCodes = {};
        const endpointHits = {};

        entries.forEach(e => {
            // Count status codes
            statusCodes[e.statusCode] = (statusCodes[e.statusCode] || 0) + 1;

            // Count endpoint hits
            const key = `${e.method} ${e.path}`;
            endpointHits[key] = (endpointHits[key] || 0) + 1;
        });

        // Most hit endpoints — sorted descending
        const topEndpoints = Object.entries(endpointHits)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([endpoint, count]) => ({ endpoint, count }));

        // IP breakdown — which IPs are most active
        const ipActivity = {};
        entries.forEach(e => {
            ipActivity[e.ip] = (ipActivity[e.ip] || 0) + 1;
        });
        const topIPs = Object.entries(ipActivity)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ip, count]) => ({ ip, count }));

        // Brute force detection — IPs with 5+ failed logins
        const failedLogins = {};
        entries
            .filter(e => e.threats && e.threats.includes('FAILED_LOGIN'))
            .forEach(e => {
                failedLogins[e.ip] = (failedLogins[e.ip] || 0) + 1;
            });
        const bruteForceIPs = Object.entries(failedLogins)
            .filter(([ip, count]) => count >= 5)
            .map(([ip, count]) => ({ ip, count }));

        res.status(200).json({
            success: true,
            stats: {
                totalRequests: entries.length,
                uniqueIPs: uniqueIPs.length,
                totalAlerts: alerts.length,
                statusCodes,
                topEndpoints,
                topIPs,
                bruteForceIPs
            },
            alerts: alerts.slice(-100),   // last 100 alerts
            recent: entries.slice(-50)    // last 50 requests
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to read logs' });
    }
});

// GET /api/logs/alerts — alerts only
router.get('/alerts', socAuth, (req, res) => {
    try {
        const entries = readLogs();
        const alerts = entries.filter(e => e.alert);
        res.status(200).json({ success: true, data: alerts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to read alerts' });
    }
});

module.exports = router;