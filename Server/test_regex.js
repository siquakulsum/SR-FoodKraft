const strictRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const relaxedRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const passwords = [
    'StrongP@ss1',
    'Password123!',
    'My#Password.1',
    'Simple1!',
    'alllowercase1!',
    'ALLUPPERCASE1!',
    'NoNumber!',
    'NoSymbol123'
];

console.log('--- Strict Regex ---');
passwords.forEach(p => {
    console.log(`"${p}": ${strictRegex.test(p)}`);
});

console.log('\n--- Relaxed Regex ---');
passwords.forEach(p => {
    console.log(`"${p}": ${relaxedRegex.test(p)}`);
});
