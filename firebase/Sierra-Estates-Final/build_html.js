const fs = require('fs');
const html = fs.readFileSync('F:/ai/virtual-tour.html', 'utf8');
const escaped = html.replace(/`/g, '\\`').replace(/\$/g, '\\$');
const content = `export const VIRTUAL_TOUR_HTML = \`${escaped}\`;\n`;
fs.writeFileSync('F:/artifacts/mobile/constants/VirtualTourHTML.ts', content);
console.log("Created VirtualTourHTML.ts");
