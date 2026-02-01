const http = require('http');

const url = 'http://127.0.0.1:5000/uploads/image-1769874316548-144513420.jpg';

const req = http.get(url, (res) => {
    console.log(`URL: ${url}`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);

    let data = [];
    res.on('data', (chunk) => {
        data.push(chunk);
        // Only read first 100 bytes then destroy
        if (Buffer.concat(data).length > 100) {
            req.destroy();
        }
    });

    res.on('end', () => { // Won't emit if destroyed, but handled by close
    });

    res.on('close', () => {
        const buffer = Buffer.concat(data);
        console.log('--- Body Preview (Hex) ---');
        console.log(buffer.slice(0, 50).toString('hex'));
        console.log('--- Body Preview (String) ---');
        console.log(buffer.slice(0, 100).toString('utf8')); // Might look like garbage if binary
    });

});

req.on('error', (e) => {
    if (e.message !== 'socket hang up') {
        console.error(`Got error: ${e.message}`);
    }
});
