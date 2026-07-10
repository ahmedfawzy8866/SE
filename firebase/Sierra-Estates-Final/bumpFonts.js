const fs = require("fs");
const path = require("path");

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk("f:/artifacts/mobile/app").concat(walk("f:/artifacts/mobile/components"));

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  const newContent = content.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
    const size = parseInt(p1, 10);
    if (size < 12) {
      modified = true;
      return "fontSize: 12";
    }
    if (size === 12 || size === 13) {
      modified = true;
      return "fontSize: 14";
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(file, newContent, "utf8");
    console.log(`Updated fonts in ${file}`);
  }
});
