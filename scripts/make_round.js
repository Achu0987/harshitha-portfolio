import sharp from 'sharp';

async function makeRound() {
  const inputPath = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\7217ed70-68c9-46db-89ce-d89fbcd181e3\\harshitha_favicon_1780377022732.png';
  const outputPath = 'c:\\harshitha\\harshitha-port\\portfolio-itom\\public\\favico.png';

  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width;
  const height = metadata.height;
  const size = Math.min(width, height);

  const circleSvg = `<svg width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
  </svg>`;

  await sharp(inputPath)
    .resize(size, size)
    .composite([{
      input: Buffer.from(circleSvg),
      blend: 'dest-in'
    }])
    .png()
    .toFile(outputPath);
    
  console.log('Successfully made the image round and saved to public/favico.png');
}

makeRound().catch(console.error);
