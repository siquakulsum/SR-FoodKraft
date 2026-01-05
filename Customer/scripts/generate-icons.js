import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG icon
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#fbbf24" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#1f2937">FK</text>
</svg>`;

// Create HTML file to convert SVG to PNG
const createIconHTML = (size) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; }
    svg { width: ${size}px; height: ${size}px; }
  </style>
</head>
<body>
  ${createSVGIcon(size)}
</body>
</html>`;

// Generate icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const htmlContent = createIconHTML(size);
  
  // Save SVG
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
  
  // Save HTML for manual conversion
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.html`), htmlContent);
  
  console.log(`Generated icon-${size}x${size}.svg`);
});

// Create a simple favicon
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG);

console.log('Icon generation complete!');
console.log('Note: You may need to convert SVG files to PNG manually or use an online converter.');
console.log('For production, consider using a proper icon design tool or service.');
