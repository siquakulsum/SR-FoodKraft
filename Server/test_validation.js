const validator = require('validator');

const testPassword = (password) => {
    const isStrong = validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    });
    console.log(`Password: "${password}" -> Strong: ${isStrong}`);
};

testPassword('StrongP@ss1');
testPassword('password');
testPassword('StrongPass1'); // No symbol
