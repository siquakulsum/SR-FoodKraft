
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const ADMIN_CREDENTIALS = {
    email: 'admin@srfoodkraft.com', // Updated to match seed
    password: 'admin123'
};

const LOG_PREFIX = '[AUDIT] ';

function log(msg) {
    console.log(LOG_PREFIX + msg);
}

function request(method, endpoint, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/api' + endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    try {
        log('Starting Audit Tests...');

        // 1. Login
        log('1. Testing Login...');
        const loginRes = await request('POST', '/auth/login', ADMIN_CREDENTIALS);
        if (loginRes.status !== 200 || !loginRes.body.token) {
            console.error('Login Failed:', loginRes.body);
            return;
        }
        const token = loginRes.body.token;
        log('✔ Login Successful. Token obtained.');

        // 2. Get Profile
        log('2. Testing Get Profile...');
        const profileRes = await request('GET', '/admin/profile', null, token);
        if (profileRes.status !== 200) {
            console.error('Get Profile Failed:', profileRes.body);
        } else {
            log(`✔ Profile Fetched: Name=${profileRes.body.data.name}, Email=${profileRes.body.data.email}`);
        }

        // 3. Update Profile (Name - No OTP)
        log('3. Testing Update Profile (Name)...');
        const updateNameRes = await request('PATCH', '/admin/profile', { name: 'Admin Audit Test' }, token);
        if (updateNameRes.status === 200) {
            log('✔ Name Update Successful (No OTP expected).');
        } else {
            console.error('Name Update Failed:', updateNameRes.body);
        }

        // 4. Update Profile (Email - Expect OTP)
        log('4. Testing Update Profile (Sensitive - Email)...');
        const updateEmailRes = await request('PATCH', '/admin/profile', { email: 'admin_update@test.com' }, token);
        if (updateEmailRes.status === 202 && updateEmailRes.body.data.otp_required) {
            log('✔ Critical Update triggered OTP correctly.');
            log(`   Message: ${updateEmailRes.body.message}`);
        } else {
            console.error('❌ Critical Update did NOT trigger OTP as expected:', updateEmailRes.status, updateEmailRes.body);
        }

        // 5. Password Policy (Weak)
        log('5. Testing Weak Password Change...');
        const weakPassRes = await request('POST', '/admin/profile/change-password', {
            currentPassword: 'admin123',
            newPassword: 'weak'
        }, token);
        if (weakPassRes.status !== 200) {
            log('✔ Weak Password Rejected.');
        } else {
            console.error('❌ Weak Password ACCEPTED! (Security Risk)', weakPassRes.body);
        }

        // 6. OTP Reuse/Bypass Simulation (Concept Check)
        // Since we can't easily get the OTP code from the running server logs without access,
        // we verified this via code review.
        log('6. Skipping OTP Extraction (Code Audit performed).');

    } catch (error) {
        console.error('Audit Script Error:', error);
    }
}

runTests();
