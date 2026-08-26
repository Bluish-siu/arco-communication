import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../../');
const srcDir = path.join(rootDir, 'src');
const serverDir = path.join(rootDir, 'server');

function getFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(fullPath, list);
      }
    } else if (/\.(jsx?|tsx?|json|env|html|css)$/.test(file)) {
      list.push(fullPath);
    }
  }
  return list;
}

const srcFiles = getFiles(srcDir);
const serverFiles = getFiles(serverDir);

console.log(`Analyzing ${srcFiles.length} frontend files and ${serverFiles.length} backend files...\n`);

const findings = {
  frontendUrls: [],
  secretsInFrontend: [],
  unprotectedRoutes: [],
  sqlInterpolations: [],
  corsConfig: null,
  securityHeaders: false,
  rateLimiting: false,
  errorHandling: null,
};

// 1. FRONTEND URL INSPECTION
for (const f of srcFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(rootDir, f).replace(/\\/g, '/');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/localhost|127\.0\.0\.1|:5000|:5173/i.test(line)) {
      findings.frontendUrls.push({ file: relPath, line: idx + 1, text: line.trim() });
    }
    // Check for secrets
    if (/GOOGLE_CLIENT_SECRET|META_APP_SECRET|JWT_SECRET|DB_PASSWORD|DATABASE_URL/i.test(line)) {
      findings.secretsInFrontend.push({ file: relPath, line: idx + 1, text: line.trim() });
    }
  });
}

// 2. BACKEND ROUTE & AUTH INSPECTION
const routeFiles = getFiles(path.join(serverDir, 'routes'));
for (const rf of routeFiles) {
  const content = fs.readFileSync(rf, 'utf8');
  const relPath = path.relative(rootDir, rf).replace(/\\/g, '/');
  const hasAuthMiddleware = /authenticateToken/i.test(content);
  findings.unprotectedRoutes.push({ file: relPath, hasAuthMiddleware });
}

// 3. SERVER CONFIG & MIDDLEWARE INSPECTION
const serverJsContent = fs.readFileSync(path.join(serverDir, 'server.js'), 'utf8');
findings.corsConfig = serverJsContent.match(/cors\(([\s\S]*?)\)/)?.[0] || 'none';
findings.securityHeaders = /helmet/i.test(serverJsContent);
findings.rateLimiting = /rateLimit|express-rate-limit/i.test(serverJsContent);

// 4. SQL INJECTION / INTERPOLATION INSPECTION
const controllerFiles = getFiles(path.join(serverDir, 'controllers'));
for (const cf of controllerFiles) {
  const content = fs.readFileSync(cf, 'utf8');
  const relPath = path.relative(rootDir, cf).replace(/\\/g, '/');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for template literals in query(...)
    if (/query\(`[^`]*\$\{[^}]*\}[^`]*`\)/i.test(line)) {
      findings.sqlInterpolations.push({ file: relPath, line: idx + 1, text: line.trim() });
    }
  });
}

// 5. ERROR HANDLER INSPECTION
const errorHandlerContent = fs.readFileSync(path.join(serverDir, 'middleware/errorHandler.js'), 'utf8');
findings.errorHandling = errorHandlerContent;

console.log('=== AUDIT RESULTS SUMMARY ===');
console.log('1. Frontend URL Findings:', findings.frontendUrls);
console.log('\n2. Secrets in Frontend:', findings.secretsInFrontend);
console.log('\n3. Route Auth Middleware Status:', findings.unprotectedRoutes);
console.log('\n4. CORS Config:', findings.corsConfig);
console.log('\n5. Helmet / Security Headers Present:', findings.securityHeaders);
console.log('\n6. Rate Limiting Present:', findings.rateLimiting);
console.log('\n7. Potential SQL String Interpolations:', findings.sqlInterpolations);
console.log('\n8. Error Handler:\n', findings.errorHandling);
