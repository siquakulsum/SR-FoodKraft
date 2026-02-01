const http = require('http');

// Use 127.0.0.1 explicitly
const url = 'http://127.0.0.1:5000/uploads/image-1769874316548-144513420.jpg';

const req = http.get(url, (res) => {
    console.log(`URL: ${url}`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);
    res.resume();
});

req.on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});

req.setTimeout(5000, () => {
    console.error('Request timed out');
    req.destroy();
});
