import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple 1x1 PNG in base64 (transparent)
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple colored PNG for each size
iconSizes.forEach(size => {
  // Create a simple colored square PNG
  const canvas = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#fbbf24" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#1f2937">FK</text>
</svg>`;
  
  // Save as SVG (will work for most browsers)
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), canvas);
  
  // For now, copy the transparent PNG as a fallback
  const pngBuffer = Buffer.from(transparentPNG, 'base64');
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), pngBuffer);
  
  console.log(`Created icon-${size}x${size}.svg and .png`);
});

// Create favicon
const faviconSVG = `
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#fbbf24" rx="3"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#1f2937">FK</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG);
fs.writeFileSync(path.join(iconsDir, 'favicon.ico'), Buffer.from(transparentPNG, 'base64'));

console.log('Basic icons created!');
console.log('Note: For production, replace these with proper branded icons.');
