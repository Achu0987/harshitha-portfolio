import sharp from 'sharp';
import fs from 'fs';

const files = [
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/corridor/drzewkowdoniczce.webp',
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/about/SOTM.webp',
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/entrance/floor_paper.webp',
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/corridor/kawalekpodlogi.webp',
  'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public/textures/corridor/szafkaprzod.webp'
];

async function optimize() {
  for (const file of files) {
    if (fs.existsSync(file)) {
      const tempPath = file + '.tmp';
      try {
        await sharp(file)
          .resize({ width: 512, withoutEnlargement: true }) // Downscale to 512px max
          .webp({ quality: 40 }) // Heavy compression
          .toFile(tempPath);
        
        fs.copyFileSync(tempPath, file);
        fs.unlinkSync(tempPath);
        console.log(`Optimized: ${file} -> ${fs.statSync(file).size} bytes`);
      } catch (e) {
        console.error(`Error: ${file}`, e);
      }
    }
  }
}

optimize();
