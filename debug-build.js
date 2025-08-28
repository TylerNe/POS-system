import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Debug Build Structure');
console.log('=========================');

const distPath = path.join(__dirname, 'dist');
const backendDistPath = path.join(__dirname, 'backend/dist');

console.log('📁 Root dist directory:', distPath);
console.log('   Exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log('   Files:', files);
}

console.log('📁 Backend dist directory:', backendDistPath);
console.log('   Exists:', fs.existsSync(backendDistPath));

if (fs.existsSync(backendDistPath)) {
  const files = fs.readdirSync(backendDistPath);
  console.log('   Files:', files.slice(0, 10)); // Show first 10 files
}

console.log('🌐 Environment Variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('📦 Package.json scripts:');
console.log('   build:', packageJson.scripts.build);
console.log('   start:', packageJson.scripts.start);
