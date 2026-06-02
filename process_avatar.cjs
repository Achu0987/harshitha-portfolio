const sharp = require('sharp');
const path = require('path');

async function processImage() {
  const input = path.join(__dirname, 'public/textures/about/awatarnachmurce_new.png');
  const output = path.join(__dirname, 'public/textures/about/awatarnachmurce_clear.png');

  console.log('Processing:', input);
  try {
      const { data, info } = await sharp(input)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        
        let alpha = 255;
        // The background looks like light grey, maybe around 200-220 brightness.
        // We set anything above 190 to transparent.
        const whitePoint = 190;
        const blackPoint = 100;
        
        if (brightness > whitePoint) {
          alpha = 0;
        } else if (brightness < blackPoint) {
          alpha = 255;
        } else {
          alpha = 255 * (1 - (brightness - blackPoint) / (whitePoint - blackPoint));
        }
        
        // Darken the drawing itself so it's clear
        data[i] = 50;
        data[i+1] = 50;
        data[i+2] = 50;
        data[i+3] = alpha;
      }

      await sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4
        }
      }).png().toFile(output);
      
      console.log('Successfully created clear image!');
  } catch (error) {
      console.error('Error processing image:', error);
  }
}

processImage();
