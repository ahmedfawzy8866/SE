const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('apps/sierra-estates-realty/.env.local', 'utf8');
const lines = envFile.split('\n');
const jsonLine = lines.find(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT_JSON='));
if (jsonLine) {
  let val = jsonLine.substring('FIREBASE_SERVICE_ACCOUNT_JSON='.length).trim();
  if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  
  try {
    console.log("Setting FIREBASE_SERVICE_ACCOUNT_JSON...");
    execSync('npx vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production --token vcp_1Rkp1qCZjzc46VSwoCyR7y7ZZPSLjSHjPQSfYZSA5WNklWePNh0ss3zF', {
      cwd: 'h:/SE/apps/sierra-estates-realty',
      input: val,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    console.log("Done");
  } catch(e) {
    console.error(e);
  }
} else {
    console.log("Could not find FIREBASE_SERVICE_ACCOUNT_JSON");
}
