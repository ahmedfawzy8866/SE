const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('h:\\SE\\.env', 'utf-8');

const lines = envFile.split('\n');

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  
  const firstEq = trimmed.indexOf('=');
  if (firstEq === -1) continue;
  
  const key = trimmed.slice(0, firstEq).trim();
  let value = trimmed.slice(firstEq + 1).trim();
  
  // Remove surrounding quotes if present
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  } else if (value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }

  if (value) {
    console.log(`Pushing ${key}...`);
    try {
      execSync(`vercel env add ${key} production,preview --value "${value.replace(/"/g, '\\"')}" --force --yes`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to push ${key}`);
    }
  }
}
console.log('Finished pushing env vars!');
