const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

// Helper to print results
const log = (label, data) => console.log(`\n=== ${label} ===\n`, JSON.stringify(data, null, 2));

const BASE_URL = 'http://localhost:5000/api/customers';
// Need a valid admin token. 
// For testing, we might need to login first or assume manual token insertion.
// I will try to login as admin if I know the credentials, or ask user to provide token.
// Existing test-login.js might have credentials.
// I'll skip auto-login to avoid complexity and just ask user to run it or rely on manual testing instructions.
// Actually, I'll attempt a login with hardcoded 'admin@example.com' / 'admin123' if it's a common default, 
// OR I'll just check health first.

// Let's make it a simple script that user can run if they have a token.
// Or usage instructions.
// "node test-customers.js <TOKEN>"

const token = process.argv[2];

if (!token) {
    console.error('Usage: node test-customers.js <BEARER_TOKEN>');
    process.exit(1);
}

const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

async function runTests() {
    try {
        // 1. Stats
        try {
            const stats = await fetch(`${BASE_URL}/stats/total`, { headers }).then(r => r.json());
            log('Stats Total', stats);
        } catch (e) { console.error('Stats Failed', e); }

        // 2. List
        let customerId;
        try {
            const list = await fetch(`${BASE_URL}?limit=5`, { headers }).then(r => r.json());
            log('List Customers', list);
            if (list.success && list.data.customers.length > 0) {
                customerId = list.data.customers[0].id;
            }
        } catch (e) { console.error('List Failed', e); }

        // 3. Details
        if (customerId) {
            try {
                const details = await fetch(`${BASE_URL}/${customerId}`, { headers }).then(r => r.json());
                log('Customer Details', details);
            } catch (e) { console.error('Details Failed', e); }
        }

        // 4. Create (Mock)
        try {
            const newC = await fetch(`${BASE_URL}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'Test Auto User',
                    email: `testauto${Date.now()}@example.com`,
                    phone: `99${Date.now().toString().slice(-8)}`,
                    password: 'password123'
                })
            }).then(r => r.json());
            log('Create Customer', newC);
            if (newC.success) customerId = newC.data.id; // Switch to new user for block test
        } catch (e) { console.error('Create Failed', e); }

        // 5. Block
        if (customerId) {
            try {
                const blocked = await fetch(`${BASE_URL}/${customerId}/block`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ reason: 'Automated test block' })
                }).then(r => r.json());
                log('Block Customer', blocked);
            } catch (e) { console.error('Block Failed', e); }

            // 6. Unblock
            try {
                const unblocked = await fetch(`${BASE_URL}/${customerId}/unblock`, {
                    method: 'PATCH',
                    headers
                }).then(r => r.json());
                log('Unblock Customer', unblocked);
            } catch (e) { console.error('Unblock Failed', e); }
        }

        // 7. Export
        try {
            const csv = await fetch(`${BASE_URL}/export`, { headers }).then(r => r.text());
            console.log('\n=== Export CSV Preview ===\n', csv.slice(0, 200) + '...');
        } catch (e) { console.error('Export Failed', e); }

    } catch (error) {
        console.error('Test Suite Error:', error);
    }
}

runTests();
