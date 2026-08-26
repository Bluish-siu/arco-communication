import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../../src');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (/\.(jsx?|tsx?|css|html)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = walkDir(srcDir);
console.log(`Auditing ${allFiles.length} source files in /src...\n`);

const auditResults = {
  todos: [],
  hardcodedLocalhost: [],
  loremIpsum: [],
};

for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(srcDir, f).replace(/\\/g, '/');

  // Check TODO
  if (/TODO|FIXME/i.test(content)) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/TODO|FIXME/i.test(line)) {
        auditResults.todos.push({ file: relPath, line: idx + 1, content: line.trim() });
      }
    });
  }

  // Check hardcoded localhost
  if (/http:\/\/localhost:5000/i.test(content)) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/http:\/\/localhost:5000/i.test(line)) {
        auditResults.hardcodedLocalhost.push({ file: relPath, line: idx + 1, content: line.trim() });
      }
    });
  }

  // Check lorem ipsum
  if (/lorem ipsum/i.test(content)) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/lorem ipsum/i.test(line)) {
        auditResults.loremIpsum.push({ file: relPath, line: idx + 1, content: line.trim() });
      }
    });
  }
}

console.log('=== AUDIT RESULTS ===');
console.log(`TODOs found: ${auditResults.todos.length}`);
if (auditResults.todos.length > 0) console.table(auditResults.todos);

console.log(`\nHardcoded localhost:5000 found: ${auditResults.hardcodedLocalhost.length}`);
if (auditResults.hardcodedLocalhost.length > 0) console.table(auditResults.hardcodedLocalhost);

console.log(`\nLorem ipsum found: ${auditResults.loremIpsum.length}`);
if (auditResults.loremIpsum.length > 0) console.table(auditResults.loremIpsum);
