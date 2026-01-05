// Authentication Test Utilities
// This file contains helper functions to test authentication features

export const testOTPFlow = () => {
  console.log('🧪 Testing OTP Authentication Flow');
  
  // Test phone number validation
  const testPhoneNumbers = [
    '+91 98765 43210',
    '9876543210',
    '+1 555 123 4567',
    'invalid-phone'
  ];
  
  testPhoneNumbers.forEach(phone => {
    const isValid = /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
    console.log(`Phone: ${phone} - Valid: ${isValid}`);
  });
  
  // Test OTP validation
  const testOTPs = [
    '123456',
    '000000',
    '999999',
    '12345', // Too short
    '1234567', // Too long
    'abc123' // Invalid characters
  ];
  
  testOTPs.forEach(otp => {
    const isValid = /^\d{6}$/.test(otp);
    console.log(`OTP: ${otp} - Valid: ${isValid}`);
  });
};

export const testPasswordReset = () => {
  console.log('🧪 Testing Password Reset Flow');
  
  // Test email validation
  const testEmails = [
    'user@example.com',
    'test@srfoodkraft.com',
    'invalid-email',
    'user@',
    '@domain.com'
  ];
  
  testEmails.forEach(email => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    console.log(`Email: ${email} - Valid: ${isValid}`);
  });
  
  // Test password validation
  const testPasswords = [
    'password123',
    'short',
    'verylongpasswordthatshouldwork',
    '123456',
    'Password123!'
  ];
  
  testPasswords.forEach(password => {
    const isValid = password.length >= 6;
    console.log(`Password: ${password} - Valid: ${isValid}`);
  });
};

export const testAuthIntegration = async () => {
  console.log('🧪 Testing Authentication Integration');
  
  try {
    // Test Supabase connection
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Supabase connection error:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    // Test OTP API endpoints (if available)
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+91 98765 43210' })
      });
      
      if (response.ok) {
        console.log('✅ OTP API endpoint accessible');
      } else {
        console.log('⚠️ OTP API endpoint not accessible (expected in development)');
      }
    } catch (error) {
      console.log('⚠️ OTP API endpoint not accessible (expected in development)');
    }
    
  } catch (error) {
    console.log('❌ Authentication integration test failed:', error);
  }
};

// Run tests when imported
if (typeof window !== 'undefined') {
  console.log('🚀 Running Authentication Tests...');
  testOTPFlow();
  testPasswordReset();
  testAuthIntegration();
}

