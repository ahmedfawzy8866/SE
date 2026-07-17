const fs = require('fs');
const { execSync } = require('child_process');

function parseEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) continue;
    const key = trimmed.slice(0, firstEq).trim();
    let value = trimmed.slice(firstEq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    if (value) env[key] = value;
  }
  return env;
}

const exampleEnv = parseEnvFile('h:\\SE\\.env.example');
const localEnv = parseEnvFile('h:\\SE\\.env.local');
const dotEnv = parseEnvFile('h:\\SE\\.env');

// Merge strategy
const merged = { ...exampleEnv, ...dotEnv, ...localEnv };

// Explicit production overrides
merged['NEXT_PUBLIC_APP_URL'] = 'https://sierra-estates.net';
merged['NEXT_PUBLIC_SITE_URL'] = 'https://sierra-estates.net';
merged['NEXT_PUBLIC_APP_ENV'] = 'production';
merged['ADMIN_HOST'] = 'admin.sierra-estates.net';
merged['CLIENT_HOST'] = 'sierra-estates.net';
merged['COOKIE_DOMAIN'] = '.sierra-estates.net';

// Use the explicit Gemini key the user provided us today
if (dotEnv['GOOGLE_AI_API_KEY'] && dotEnv['GOOGLE_AI_API_KEY'].startsWith('AQ.')) {
  merged['GOOGLE_AI_API_KEY'] = dotEnv['GOOGLE_AI_API_KEY'];
  merged['GOOGLE_GENAI_API_KEY'] = dotEnv['GOOGLE_AI_API_KEY'];
  merged['NEXT_PUBLIC_GEMINI_API_KEY'] = dotEnv['GOOGLE_AI_API_KEY'];
}

// Ensure the massive Firebase JSON isn't overwritten by mistake
if (dotEnv['FIREBASE_SERVICE_ACCOUNT_JSON']) {
  merged['FIREBASE_SERVICE_ACCOUNT_JSON'] = dotEnv['FIREBASE_SERVICE_ACCOUNT_JSON'];
}

for (const [key, value] of Object.entries(merged)) {
  console.log(`Pushing ${key}...`);
  try {
    const escapedValue = value.replace(/"/g, '\\"');
    execSync(`vercel env add ${key} production,preview --value "${escapedValue}" --force --yes`, { stdio: 'pipe' });
    console.log(`  -> Success`);
  } catch (e) {
    console.error(`  -> Failed: ${e.message}`);
  }
}

console.log('Finished merging and pushing all variables to Vercel!');
