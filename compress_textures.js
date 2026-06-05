import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dirs = [
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/entrance',
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/corridor',
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/about'
];

async function optimizeImages() {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.webp') && !file.includes('_backup') && !file.includes('_ORIGINAL') && !file.includes('_opt')) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.size > 100000) {
          console.log(`Optimizing ${file} (${stats.size} bytes)`);
          const tempPath = filePath.replace('.webp', '_opt.webp');
          try {
            await sharp(filePath)
              .resize({ width: 1024, withoutEnlargement: true })
              .webp({ quality: 60, effort: 6 })
              .toFile(tempPath);
            const newStats = fs.statSync(tempPath);
            console.log(` -> Reduced to ${newStats.size} bytes`);
            fs.copyFileSync(tempPath, filePath);
            fs.unlinkSync(tempPath);
          } catch (e) {
            console.error(`Error optimizing ${file}:`, e);
          }
        }
      }
    }
  }
}

optimizeImages();
