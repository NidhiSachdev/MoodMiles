/**
 * Copy vercel.json to web-build folder after build
 * This ensures Vercel configuration is included in deployment
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '..', 'vercel.json');
const destDir = path.join(__dirname, '..', 'web-build');
const destFile = path.join(destDir, 'vercel.json');

// Check if web-build exists
if (!fs.existsSync(destDir)) {
  console.log('⚠️  web-build directory does not exist. Run "npx expo export:web" first.');
  process.exit(1);
}

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.log('⚠️  vercel.json not found in root. Creating default...');
  // Create default vercel.json
  const defaultConfig = {
    rewrites: [
      {
        source: '/(.*)',
        destination: '/index.html'
      }
    ]
  };
  fs.writeFileSync(sourceFile, JSON.stringify(defaultConfig, null, 2));
  console.log('✅ Created vercel.json');
}

// Copy vercel.json
try {
  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(sourceFile, destFile);
  console.log('✅ Copied vercel.json to web-build/');
} catch (error) {
  console.error('❌ Error copying vercel.json:', error.message);
  process.exit(1);
}
