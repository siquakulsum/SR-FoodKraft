const http = require('http');

const checkRoute = (method, path) => {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
    };

    const req = http.request(options, (res) => {
        console.log(`${method} ${path} -> Status: ${res.statusCode}`);
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.end();
};

checkRoute('POST', '/api/admin/profile/change-password');
