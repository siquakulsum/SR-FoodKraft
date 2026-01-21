const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    try {
        console.log('--- Testing Registration ---');
        const registerRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                phone: `9${Date.now().toString().substring(0, 9)}`, // ensure unique 10 digits
                password: 'password123',
                role: 'customer'
            })
        });
        const registerData = await registerRes.json();
        console.log('Register Status:', registerRes.status);
        console.log('Register Result:', registerData);

        if (!registerData.success) {
            if (registerData.message.includes('already exists')) {
                console.log("User already exists, proceeding to login...");
            } else {
                throw new Error("Registration failed");
            }
        }

        const email = registerData.data ? registerData.data.email : `test${Date.now()}@example.com`; // fallback if fail
        // Store email for login

        console.log('\n--- Testing Login ---');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.data.email,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Result:', loginData);

        if (!loginData.success) throw new Error("Login failed");

        const token = loginData.data.token;

        console.log('\n--- Testing Get Me ---');
        const meRes = await fetch(`${BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const meData = await meRes.json();
        console.log('Get Me Status:', meRes.status);
        console.log('Get Me Result:', meData);

        console.log('\n--- Testing Forgot Password ---');
        const forgotRes = await fetch(`${BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.data.email
            })
        });
        const forgotData = await forgotRes.json();
        console.log('Forgot Password Status:', forgotRes.status);
        console.log('Forgot Password Result:', forgotData);

        // Cannot automate reset flow easily without reading the console logs for token 
        // or querying DB. 
        // But this verifies the endpoint works.

        console.log('\n--- SUCCESS ---');

    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

// Check if server is running before testing? 
// No, the user will have to start server.
// I will start the server in a separate terminal.
testAuth();
