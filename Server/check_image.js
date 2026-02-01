const http = require('http');

const url = 'http://localhost:5000/uploads/image-1769874316548-144513420.jpg';

http.get(url, (res) => {
    console.log(`URL: ${url}`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);

    // Consume response to free memory
    res.resume();
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
