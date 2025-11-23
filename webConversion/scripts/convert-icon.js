import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSvg = path.join(__dirname, '../public/gear.svg');
const outputPng = path.join(__dirname, '../public/gear.png');
const outputIco = path.join(__dirname, '../public/gear.ico');

async function convert() {
  try {
    console.log('Converting SVG to PNG...');
    await sharp(inputSvg)
      .resize(512, 512)
      .png()
      .toFile(outputPng);
    console.log('PNG created:', outputPng);

    console.log('Converting PNG to ICO...');
    const buf = await pngToIco(outputPng);
    fs.writeFileSync(outputIco, buf);
    console.log('ICO created:', outputIco);

    console.log('Conversion complete!');
  } catch (err) {
    console.error('Error converting icon:', err);
    process.exit(1);
  }
}

convert();
