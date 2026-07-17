const fs = require('fs');

const adminFiles = [
  'H:/SE/apps/sierra-estates-realty/app/api/admin/leads/route.ts',
  'H:/SE/apps/sierra-estates-realty/app/api/admin/automations/route.ts',
  'H:/SE/apps/sierra-estates-realty/app/api/admin/agents/route.ts',
  'H:/SE/apps/sierra-estates-realty/app/api/admin/db/[collection]/route.ts'
];

const cronFiles = [
  'H:/SE/apps/sierra-estates-realty/app/api/cron/sync-leads/route.ts',
  'H:/SE/apps/sierra-estates-realty/app/api/cron/ingest-from-sheets/route.ts',
  'H:/SE/apps/sierra-estates-realty/app/api/cron/sync-listings/route.ts',
  'H:/SE/apps/sierra-estates-realty/app/api/cron/maintenance/route.ts'
];

function processAdminFiles() {
  for (const file of adminFiles) {
    let content = fs.readFileSync(file, 'utf8');

    // Make sure we have the import
    if (!content.includes('withAdminAuth')) {
      if (content.includes('import { verifyAdminRequest')) {
        content = content.replace(
          /import \{ verifyAdminRequest(.*?) \} from '@\/lib\/server\/auth-guard';/,
          "import { verifyAdminRequest$1 } from '@/lib/server/auth-guard';\nimport { withAdminAuth } from '@/lib/middleware/auth-guard';"
        );
      } else {
        content = "import { withAdminAuth } from '@/lib/middleware/auth-guard';\n" + content;
      }
    }

    const methods = ['GET', 'POST', 'PATCH', 'DELETE'];
    let appendExports = [];

    for (const method of methods) {
      const functionRegex = new RegExp(`export async function ${method}\\((.*?)\\) \\{`, 'g');
      
      content = content.replace(functionRegex, (match, args) => {
        const handlerName = `${method.toLowerCase()}Handler`;
        appendExports.push(`export const ${method} = withAdminAuth(${handlerName});`);
        return `const ${handlerName} = async (${args}) => {`;
      });
    }

    if (appendExports.length > 0) {
      // we only want to append if we actually replaced something
      // wait, I also want to remove the standard unauthorized block if it doesn't break things.
      // let's just leave verifyAdminRequest(req) but remove the `if (!authResult.authenticated) { return ... }`
      content = content.replace(
        /if \(\!authResult\.authenticated\) \{\s*return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\}/g,
        "// auth already verified by withAdminAuth"
      );
      
      content += '\n' + appendExports.join('\n') + '\n';
    }
    
    fs.writeFileSync(file, content);
    console.log('Processed admin:', file);
  }
}

function processCronFiles() {
  for (const file of cronFiles) {
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('withSecretKey')) {
      content = "import { withSecretKey } from '@/lib/middleware/auth-guard';\n" + content;
    }

    const methods = ['GET', 'POST', 'PATCH', 'DELETE'];
    let appendExports = [];

    for (const method of methods) {
      const functionRegex = new RegExp(`export async function ${method}\\((.*?)\\) \\{`, 'g');
      
      content = content.replace(functionRegex, (match, args) => {
        const handlerName = `${method.toLowerCase()}Handler`;
        appendExports.push(`export const ${method} = withSecretKey(${handlerName});`);
        return `const ${handlerName} = async (${args}) => {`;
      });
    }

    if (appendExports.length > 0) {
      // Remove cron secret check
      content = content.replace(
        /const authHeader = req\.headers\.get\('authorization'\);\s*const cronSecret = process\.env\.CRON_SECRET;\s*if \(cronSecret && authHeader !== `Bearer \$\{cronSecret\}`\) \{\s*return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\}/g,
        "// cron secret verified by withSecretKey wrapper"
      );
      
      // another variant in ingest-from-sheets:
      content = content.replace(
        /const authHeader = req\.headers\.get\('authorization'\);\s*const cronSecret = process\.env\.CRON_SECRET;\s*if \(cronSecret && authHeader !== `Bearer \$\{cronSecret\}`\) \{\s*return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\}/g,
        "// cron secret verified by withSecretKey wrapper"
      );

      content += '\n' + appendExports.join('\n') + '\n';
    }

    fs.writeFileSync(file, content);
    console.log('Processed cron:', file);
  }
}

processAdminFiles();
processCronFiles();
