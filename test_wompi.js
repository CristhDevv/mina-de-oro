require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const ref = 'test-ref-123';
const amount = 1000000;
const currency = 'COP';
const key = process.env.WOMPI_INTEGRITY_KEY;
console.log('KEY presente:', !!key);
console.log('Cadena:', `${ref}${amount}${currency}${key}`);
console.log('SHA256:', crypto.createHash('sha256').update(`${ref}${amount}${currency}${key}`).digest('hex'));
