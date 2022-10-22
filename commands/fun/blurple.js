const canvas = require('canvas');
module.exports = {
	config: {
		name: 'blurple',
		category: 'fun',
		cooldown: 4,
		aliases: ['blurp'],
		description: 'Это же БЛУРПЛ!',
		usage: '<@пользователь/его id/url картинки> <-url(при url)>'
	},
	run: async(bot, message, args) => {
		const emb = new bot.Embed()
		.setColor('#fffffe')
		.setTimestamp();
		const url = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif))/i.test(args[0]) ? args[0] : (message.attachments.first()?.url || (message.mentions.users.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x)) || message.author).avatarURL({size: 1024, dynamic: true, format: 'png'}));
		if(!url) return message.say({embeds: [emb.setDescription('Скорее всего у указного вами пользователем (или у вас) отсутствует аватар.')]});
		const img = new canvas.Image();
		const blurple = (ctx, x, y) => {
  			const imgData = ctx.getImageData(0, 0, x, y);
  			const pixels = imgData.data;
  			for (let i = 0; i < pixels.length; i += 4) {
  				if(pixels[i+3] !== 0){
  					const lightness = ~~(+((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3));
			    	pixels[i] = lightness, pixels[i + 1] = lightness, pixels[i + 2] = lightness;
			    }
			}
			ctx.putImageData(imgData, 0, 0);
        	ctx.globalAlpha=0.7;
        	ctx.globalCompositeOperation="overlay";
        	ctx.fillStyle="#7289DA";
        	ctx.fillRect(0,0,x,y);
        	return ctx;
		}
		img.onload = async() => {
			const w = img.width, h = img.height;
			const Canvas = canvas.createCanvas(w, h);
			const ctx = Canvas.getContext('2d');
			if(/\.gif/.test(url)){
		      	const gifenc = require('gifencoder');
				const imageFrames = await require('gif-frames')({
					url: await util.downloadImage(url),
					frames: "all"
				});
				const gif = new gifenc(w, h);
			    gif.start();
			    gif.setRepeat(0);
			    gif.setDelay(imageFrames[0].frameInfo.delay*10);
			    gif.setQuality(10);
				for (const frame of imageFrames) {
					gif.setDelay(frame.frameInfo.delay*10);
					const imageFrame = await canvas.loadImage(await util.promisedStream(frame.getImage()));
					ctx.drawImage(imageFrame, 0, 0, w, h);
					delete imageFrame;
					blurple(ctx, w, h);
					ctx.globalAlpha=1;
					gif.addFrame(ctx);
					ctx.clearRect(0, 0, w, h);
				}
		      	gif.finish();
				message.say({files: [{ name: `blurple-${Date.now()}.gif`, attachment: gif.out.getData()}]});
			}
			ctx.drawImage((await canvas.loadImage(url)), 0, 0);
			blurple(ctx, w, h);
			message.say({files: [{ name: `blurple-${Date.now()}.png`, attachment: Canvas.toBuffer()}]});
		};
		img.src = url;
	}
};