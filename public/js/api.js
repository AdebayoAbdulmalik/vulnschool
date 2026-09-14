// Shared API wrapper — every page's fetch calls go through here,
// so the base URL and token-attaching logic only live in one place.

const API_BASE = window.location.origin + '/api';

// Generic request helper.
// method: 'GET', 'POST', 'PUT', 'DELETE'
// path: e.g. '/auth/login', '/courses/123'
// body: plain JS object, will be JSON.stringify'd (omit for GET)
// auth: true if this request needs the JWT attached
async function apiRequest(method, path, body = null, auth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // If this request needs auth, pull the token from localStorage
    // and attach it as a Bearer token.
    if (auth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + path, options);
    const data = await response.json();

    // Attach the HTTP status so callers can branch on it if needed
    data._status = response.status;

    return data;
}