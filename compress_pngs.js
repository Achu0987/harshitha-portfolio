import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

async function optimize() {
  const publicDir = 'c:/harshitha/Personal-Project/harshitha-developer-portfolio/public';
  walkDir(publicDir, async (filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      const stats = fs.statSync(filePath);
      if (stats.size > 50000) { // > 50KB
        console.log(`Optimizing ${filePath} (${stats.size} bytes)`);
        const tempPath = filePath + '.tmp';
        try {
          if (filePath.endsWith('.png')) {
            await sharp(filePath)
              .resize({ width: 800, withoutEnlargement: true })
              .png({ quality: 60, compressionLevel: 9 })
              .toFile(tempPath);
          } else {
            await sharp(filePath)
              .resize({ width: 800, withoutEnlargement: true })
              .jpeg({ quality: 60 })
              .toFile(tempPath);
          }
          fs.copyFileSync(tempPath, filePath);
          fs.unlinkSync(tempPath);
          console.log(` -> Reduced to ${fs.statSync(filePath).size} bytes`);
        } catch (e) {
          console.error(`Error optimizing ${filePath}:`, e);
        }
      }
    }
  });
}

optimize();
