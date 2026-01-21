const http = require('http');

const postData = JSON.stringify({
    email: 'admin@test.com',
    password: 'test123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing POST /api/auth/login...\n');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        console.log(data);

        try {
            const json = JSON.parse(data);
            console.log('\nParsed JSON:');
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('\nFailed to parse as JSON. Response is HTML or invalid JSON.');
        }
    });
});

req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
});

req.write(postData);
req.end();
