const http = require('http');

const filename = '1769945003494_avatar.jpg'; // From user screenshot
const path = `/uploads/avatars/${filename}`;
const url = `http://localhost:5000${path}`;

console.log(`Testing URL: ${url}`);

http.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);

    if (res.statusCode === 200) {
        console.log('SUCCESS: Image is served correctly.');
    } else {
        console.log('FAILURE: Image not found or error.');
    }
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
