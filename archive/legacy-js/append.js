const fs = require('fs');

function append(file) {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes('export const GET')) {
    c += '\nexport const GET = withAdminAuth(getHandler);\nexport const POST = withAdminAuth(postHandler);\n';
    fs.writeFileSync(file, c);
  }
}

append('H:/SE/apps/sierra-estates-realty/app/api/admin/leads/route.ts');
append('H:/SE/apps/sierra-estates-realty/app/api/admin/agents/route.ts');
