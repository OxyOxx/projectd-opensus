const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');
const FRAMES = 5;
const RESOLUTION = 256;
const DELAY = 40;
const petGifCache = [];
module.exports = async(url) => {
    const encoder = new GIFEncoder(RESOLUTION, RESOLUTION);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(DELAY);
    const canvas = Canvas.createCanvas(RESOLUTION, RESOLUTION);
    const ctx = canvas.getContext('2d');
    const avatar = await Canvas.loadImage(url);
    for (let i = 0; i < FRAMES; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const j = i < FRAMES / 2 ? i : FRAMES - i;
        const width = .8 + j * .02;
        const height = .7 - j * .05;
        const offsetX = (1 - width) * .5 + .1;
        const offsetY = (1 - height) - .08;
        if (i == petGifCache.length) petGifCache.push(await Canvas.loadImage(require('path').resolve(`./assets/pp_asset/pet${i}.png`)));
        ctx.drawImage(avatar, RESOLUTION * offsetX, RESOLUTION * offsetY, RESOLUTION * width, RESOLUTION * height);
        ctx.drawImage(petGifCache[i], 0, 0, RESOLUTION, RESOLUTION);
        encoder.addFrame(ctx);
    }
    encoder.finish()
    return encoder.out.getData()
}
