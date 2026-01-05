// Test utility for pincode lookup functionality
import { lookupPincode, validatePincode } from './pincodeLookup';

export const testPincodeLookup = async () => {
  console.log('🧪 Testing Pincode Lookup Functionality');
  
  // Test pincode validation
  const testPincodes = [
    '600001', // Valid Chennai pincode
    '110001', // Valid Delhi pincode
    '400001', // Valid Mumbai pincode
    '12345',  // Invalid - too short
    '1234567', // Invalid - too long
    'abc123',  // Invalid - contains letters
    '600 001', // Valid with space
    '+91 600001', // Valid with country code
  ];
  
  console.log('\n📋 Testing Pincode Validation:');
  testPincodes.forEach(pincode => {
    const isValid = validatePincode(pincode);
    console.log(`Pincode: ${pincode} - Valid: ${isValid}`);
  });
  
  // Test pincode lookup
  console.log('\n🔍 Testing Pincode Lookup:');
  const lookupTests = [
    '600001', // Chennai
    '110001', // Delhi
    '400001', // Mumbai
    '560001', // Bangalore
    '999999', // Non-existent
  ];
  
  for (const pincode of lookupTests) {
    try {
      const result = await lookupPincode(pincode);
      if (result) {
        console.log(`✅ ${pincode}: ${result.city}, ${result.state}${result.area ? `, ${result.area}` : ''}`);
      } else {
        console.log(`❌ ${pincode}: Not found in database`);
      }
    } catch (error) {
      console.log(`❌ ${pincode}: Error - ${error}`);
    }
  }
  
  // Test edge cases
  console.log('\n🧪 Testing Edge Cases:');
  
  // Empty string
  const emptyResult = await lookupPincode('');
  console.log(`Empty string: ${emptyResult ? 'Found' : 'Not found'}`);
  
  // Null/undefined
  const nullResult = await lookupPincode(null as any);
  console.log(`Null input: ${nullResult ? 'Found' : 'Not found'}`);
  
  // Special characters
  const specialResult = await lookupPincode('600-001');
  console.log(`Special chars (600-001): ${specialResult ? 'Found' : 'Not found'}`);
  
  console.log('\n✅ Pincode lookup testing completed!');
};

// Run tests when imported
if (typeof window !== 'undefined') {
  console.log('🚀 Running Pincode Lookup Tests...');
  testPincodeLookup();
}

