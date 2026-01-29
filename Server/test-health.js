const http = require('http');

console.log('Testing GET /health...\n');

http.get('http://localhost:5000/health', (res) => {
    console.log(`Status Code: ${res.statusCode}\n`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:');
        console.log(data);
    });
}).on('error', (e) => {
    console.error(`Error: ${e.message}`);
});
