const canvas = require('canvas');
module.exports = {
	config: {
		name: 'pixelate',
		category: 'fun',
		cooldown: 4,
		aliases: ['pixel'],
		description: 'Сделать изображение пиксельным.',
		usage: '<(@)пользователь/id/url> <размер пикселя>'
	},
	run: async(bot, message, args) => {
		const emb = new bot.Embed()
		.setColor('#fffffe')
		.setTimestamp();
		const url = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif))/i.test(args[0]) ? args[0] : (message.attachments.first()?.url || (message.mentions.users.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x)) || message.author).avatarURL({size: 512, extension: 'png'}));
		if(!url) return message.say({embeds: [emb.setDescription('Скорее всего у указного вами пользователем (или у вас) отсутствует аватар.')]});
		message.channel.sendTyping();
		const img = new canvas.Image();
		const pixelate = (size, ctx, w, h) => {
				const pixelArr = ctx.getImageData(0, 0, w, h).data;
	      		for (let y = 0; y < h; y += size) {
	        		for (let x = 0; x < w; x += size) {
	          			let p = (x + (y*w)) * 4;
	          			ctx.fillStyle = `rgba(${pixelArr[p]},${pixelArr[p+1]},${pixelArr[p+2]},${pixelArr[p+3]})`;
	          			ctx.fillRect(x, y, size, size);
	        		}
	      		}
	     		return ctx;
			}
		img.onload = async() => {
			const size = +args.last()||16;
			const w = img.width, h = img.height;
			const Canvas = canvas.createCanvas(w, h);
			const ctx = Canvas.getContext('2d');
			if(/\.gif/.test(url)){
		      	const gifenc = require('gifencoder');
		      	const loadedImage = await util.downloadImage(url);
				const imageFrames = await require('gif-frames')({
					url: loadedImage,
					frames: "all",
					quality: 100,
					cumulative: true
				});
				const imageContainer = [0, 0, w, h];
				const gif = new gifenc(w, h);
			    gif.start();
			    gif.setRepeat(0);
			    gif.setDelay(imageFrames[0].frameInfo.delay);
			    gif.setQuality(10);
				for (const frame of imageFrames) {
          			gif.setDelay(frame.frameInfo.delay);
					ctx.clearRect(...imageContainer);
					const imageFrame = await canvas.loadImage(await util.promisedStream(frame.getImage()));
					ctx.drawImage(imageFrame, ...imageContainer);
					delete imageFrame;
					pixelate(size, ctx, w, h);
					gif.addFrame(ctx);
				}
		      	gif.finish();
				message.say({files: [{ name: `pixelate-${Date.now()}.gif`, attachment: gif.out.getData()}]});
			}
			ctx.drawImage((await canvas.loadImage(url)), 0, 0);
			pixelate(size, ctx, img.width, img.height);
			message.say({files: [{ name: `pixelate-${Date.now()}.png`, attachment: Canvas.toBuffer()}]});
		};
		img.src = url;
	}
};
