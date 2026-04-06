const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const ref = 'test-ref-123';
const amount = 1000000;
const currency = 'COP';
const key = process.env.WOMPI_INTEGRITY_KEY;

console.log('INTEGRITY KEY presente:', !!key);
console.log('KEY empieza con:', key?.slice(0, 15));
console.log('Cadena a firmar:', `${ref}${amount}${currency}${key?.slice(0,10)}...`);
console.log('SHA256:', crypto.createHash('sha256').update(`${ref}${amount}${currency}${key}`).digest('hex'));
