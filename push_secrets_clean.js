const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('apps/sierra-estates-realty/.env.local', 'utf8');
const lines = envFile.split('\n');

const varsToAdd = ['CRON_SECRET', 'SBR_SECRET_KEY'];

varsToAdd.forEach(key => {
  const line = lines.find(l => l.startsWith(`${key}=`));
  if (line) {
    let val = line.substring(`${key}=`.length).trim().replace(/\r/g, '');
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    
    try {
      console.log(`Setting ${key}...`);
      execSync(`npx vercel env add ${key} production --token vcp_1Rkp1qCZjzc46VSwoCyR7y7ZZPSLjSHjPQSfYZSA5WNklWePNh0ss3zF`, {
        cwd: 'h:/SE/apps/sierra-estates-realty',
        input: val,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log("Done");
    } catch(e) {
      console.error(`Failed to set ${key}`, e);
    }
  }
});
