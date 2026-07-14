const fs = require('fs');
const filePath = 'f:/artifacts/mobile/data/properties.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Update Interface
content = content.replace(/type:.*?\n/, match => match + '  status: \'rent\' | \'resale\';\n  furnished: boolean;\n');

// Standardize compounds
const compounds = ['Uptown Cairo', 'Mivida', 'Madinaty', 'Hyde Park', '5th Settlement', 'Al Rehab', 'Palm Hills New Cairo', 'Mountain View iCity', 'ZED East', 'Villette', 'Eastown', 'El Sherouk', 'New Capital'];
let i = 0;

// Add fields to each object
content = content.replace(/type: (.*?),\n/g, (match) => {
  const isRent = i % 3 === 0;
  const isFurnished = i % 2 === 0;
  i++;
  return match + '    status: ' + (isRent ? "'rent'" : "'resale'") + ',\n    furnished: ' + isFurnished + ',\n';
});

content = content.replace(/compound: \".*?\"/g, () => {
  return 'compound: \"' + compounds[Math.floor(Math.random() * compounds.length)] + '\"';
});

fs.writeFileSync(filePath, content);
console.log('Updated properties.ts');
