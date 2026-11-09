// Creates backend/.env and frontend/.env from the .env.example files (only if missing)
// and generates a random JWT secret for local development.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');

function ensureEnv(dir, transform) {
  const example = path.join(root, dir, '.env.example');
  const target = path.join(root, dir, '.env');
  if (fs.existsSync(target)) {
    console.log(`- ${dir}/.env already exists (left unchanged)`);
    return;
  }
  let content = fs.readFileSync(example, 'utf8');
  if (transform) content = transform(content);
  fs.writeFileSync(target, content);
  console.log(`- created ${dir}/.env`);
}

ensureEnv('backend', (c) =>
  c.replace('replace_with_a_long_random_string_at_least_32_characters', crypto.randomBytes(48).toString('hex'))
);
ensureEnv('frontend');

console.log('\nEnvironment files are ready. Make sure MongoDB is running, then run: npm run dev');
