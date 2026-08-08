const Jimp = require('jimp');

async function processImage() {
  try {
    console.log('Reading image...');
    const image = await Jimp.read('logo/VAYNA.png');
    
    console.log('Auto-cropping white border...');
    // crop white border
    image.autocrop({ tolerance: 0.1 });
    
    console.log('Making white background transparent...');
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If it's white or very close to white
      if (r > 240 && g > 240 && b > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha = 0 (transparent)
      }
    });

    console.log('Saving to assets/icon.png and assets/splash.png...');
    await image.writeAsync('assets/icon.png');
    
    // For splash screen, let's put the logo on a dark background
    // Create a new dark image 1024x1024
    const splash = new Jimp(1024, 1024, '#09090b'); // bg-background color
    
    // Resize the logo to fit nicely in the center (e.g. 512 width)
    image.scaleToFit(512, 512);
    
    const x = (1024 - image.bitmap.width) / 2;
    const y = (1024 - image.bitmap.height) / 2;
    
    splash.composite(image, x, y);
    await splash.writeAsync('assets/splash.png');

    console.log('Processing complete!');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
