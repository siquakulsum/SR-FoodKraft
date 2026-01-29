const db = require('./models');
const fs = require('fs');

async function testFAQQuery() {
    const log = [];
    try {
        log.push('Testing FAQ query...');
        const faqs = await db.CMSFAQ.findAll();
        log.push(`Found ${faqs.length} FAQs`);
        faqs.forEach(faq => {
            log.push(`- ${faq.question} (ID: ${faq.id})`);
        });
        fs.writeFileSync('test-output.txt', log.join('\n'));
        console.log('Success! Check test-output.txt');
        process.exit(0);
    } catch (error) {
        log.push(`Error: ${error.message}`);
        log.push(`Stack: ${error.stack}`);
        fs.writeFileSync('test-output.txt', log.join('\n'));
        console.log('Error! Check test-output.txt');
        process.exit(1);
    }
}

testFAQQuery();
