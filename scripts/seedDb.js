/* istanbul ignore file */
const seed = require('./seed');

if (process.env.NODE_ENV !== 'test') {
  /* WARNING THIS WILL DROP THE CURRENT DATABASE */
  seed();
}
