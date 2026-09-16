const API_BASE = window.location.origin + '/api';


async function apiRequest(method, path, body = null, auth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

   
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

    data._status = response.status;

    return data;
}