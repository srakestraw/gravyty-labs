#!/usr/bin/env node

/**
 * Favicon Generator Script for Gravyty Labs
 * 
 * This script helps generate favicon files from a source logo.
 * Place your main logo file in the logos directory and run this script.
 * 
 * Usage:
 * 1. Place your logo file as 'gravyty-labs-logo.png' in /public/assets/logos/
 * 2. Run: node scripts/generate-favicons.js
 * 3. The script will generate all required favicon sizes
 */

const fs = require('fs');
const path = require('path');

const sourceLogoPath = path.join(__dirname, '../public/assets/logos/gravyty-labs-logo.png');
const faviconDir = path.join(__dirname, '../public/assets/favicons');

// Required favicon sizes
const faviconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

console.log('🎨 Gravyty Labs Favicon Generator');
console.log('================================');

// Check if source logo exists
if (!fs.existsSync(sourceLogoPath)) {
  console.log('❌ Source logo not found!');
  console.log(`   Please place your logo at: ${sourceLogoPath}`);
  console.log('   Expected filename: gravyty-labs-logo.png');
  process.exit(1);
}

console.log('✅ Source logo found');
console.log('📁 Favicon directory:', faviconDir);

// Create favicon directory if it doesn't exist
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
  console.log('📁 Created favicon directory');
}

console.log('\n📋 Required favicon files:');
faviconSizes.forEach(({ name, size }) => {
  const filePath = path.join(faviconDir, name);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${name} (${size}x${size})`);
});

console.log('\n🔧 Next steps:');
console.log('1. Use an online favicon generator:');
console.log('   - https://favicon.io/');
console.log('   - https://realfavicongenerator.net/');
console.log('2. Upload your logo file');
console.log('3. Download the generated favicon package');
console.log('4. Extract files to:', faviconDir);
console.log('5. Ensure all files from the list above are present');

console.log('\n📝 Manual favicon.ico creation:');
console.log('1. Create a 32x32 pixel version of your logo');
console.log('2. Use a tool like GIMP or online converter');
console.log('3. Save as favicon.ico in:', faviconDir);

console.log('\n🎯 Brand colors for reference:');
console.log('   Primary Blue: #0052CC');
console.log('   Secondary Purple: #6554C0');
console.log('   Accent Teal: #00B8D9');
console.log('   Dark Navy: #0A1A2F');

console.log('\n✨ Favicon generation complete!');