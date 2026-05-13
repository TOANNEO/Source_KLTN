/**
 * Script to generate bcrypt password hashes for seed data
 * Usage: node scripts/generateHash.js <password>
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');

const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const main = async () => {
  const password = process.argv[2] || '123456';

  console.log('Generating bcrypt hash...');
  console.log('Password:', password);

  const hash = await generateHash(password);

  console.log('Hash:', hash);
  console.log('\nSQL Insert example:');
  console.log(`INSERT INTO users (email, password, role, first_name, last_name) VALUES`);
  console.log(`('user@tlu.edu.vn', '${hash}', 'student', 'First', 'Last');`);
};

main().catch(console.error);
