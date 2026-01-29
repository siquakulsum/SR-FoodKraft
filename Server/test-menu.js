const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
let adminToken = '';

async function loginAdmin() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@srfoodkraft.com',
            password: 'admin1234'
        });
        adminToken = response.data.token;
        console.log('✓ Login successful');
    } catch (error) {
        console.error('✗ Login failed:', error.response?.data?.message || error.message);
        process.exit(1);
    }
}

async function listMenuItems() {
    try {
        const response = await axios.get(`${API_URL}/menu-items`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log(`✓ List Menu Items successful. Count: ${response.data.data.items.length}`);
    } catch (error) {
        console.error('✗ List Menu Items failed:', error.response?.data?.message || error.message);
    }
}

async function test() {
    console.log('Starting Menu System Verification...');
    await loginAdmin();
    await listMenuItems();
}

test();
