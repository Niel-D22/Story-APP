

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if not exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG placeholder for each size
sizes.forEach(size => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#667eea"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="${size/4}" font-family="Arial">
        SM
      </text>
    </svg>
  `.trim();
  
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}x${size}.svg`),
    svg
  );
  
  console.log(`✅ Generated icon-${size}x${size}.svg`);
});

console.log('All icons generated successfully!');
console.log('Location: public/icons/');
console.log('  Note: These are placeholder SVGs.');
console.log('For production, use PNG icons from https://www.pwabuilder.com/imageGenerator');