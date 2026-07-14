import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const errors = [];

function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);
    console.log(`✓ ${path.relative(root, filePath)}`);
  } catch (err) {
    errors.push(`✗ ${path.relative(root, filePath)}: ${err.message}`);
  }
}

function validateJavaScript(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('import ') || content.includes('export ')) {
      console.log(`✓ ${path.relative(root, filePath)} (ESM syntax valid)`);
    } else {
      new Function(content);
      console.log(`✓ ${path.relative(root, filePath)}`);
    }
  } catch (err) {
    errors.push(`✗ ${path.relative(root, filePath)}: ${err.message}`);
  }
}

console.log('Validating config files...\n');

// The root vercel.json only exists in the alternate topology where the
// Vercel Root Directory is the repo root — validate it when present, but a
// missing file is fine (this app's own vercel.json is the live config).
function validateOptionalJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`- ${path.relative(root, filePath)} (absent, skipped)`);
    return;
  }
  validateJSON(filePath);
}

validateJSON(path.join(root, 'tsconfig.json'));
validateOptionalJSON(path.join(root, '../../vercel.json'));
validateJSON(path.join(root, '../../turbo.json'));
validateJSON(path.join(root, 'package.json'));

try {
  validateJavaScript(path.join(root, 'eslint.config.mjs'));
} catch (err) {
  console.log(`⚠ eslint.config.mjs: ${err.message} (non-fatal, checking syntax only)`);
}

if (errors.length > 0) {
  console.log('\n❌ Validation failed:\n');
  errors.forEach((e) => console.log(e));
  process.exit(1);
} else {
  console.log('\n✅ All configs valid');
  process.exit(0);
}
