const canvas = require('canvas');
module.exports = {
	data: {
		name: 'blurple',
		description_localizations: {
			'en-US': 'BLURPLE!'
		},
		description: 'Ну тип... покрасить картинку в блурп?',
		options: [{
					name: 'пользователь',
  					description: 'Заблюрпить кого-то',
  					type: 6
  					},
  					{
		         	 type: 3,
		         	 name: 'url',
		         	 description: 'URL'
		        }]
	},
	async run(bot, interaction) {
		//const emb = new bot.Embed({color: 16777215}).setTimestamp();
		const url = interaction.options.getString('url') || (interaction.options.getUser('пользователь') || interaction.user).avatarURL({size: 1024, dynamic: true, format: 'png'});
		if(!url) return interaction.reply({embeds: [emb.setDescription('Скорее всего у указного вами пользователем (или у вас) отсутствует аватар.')]});
		const img = new canvas.Image();
		await interaction.reply({content: util.consts.replies[~~(Math.random() * util.consts.replies.length)]});
		const blurple = (ctx, w, h) => {
  			const imgData = ctx.getImageData(0, 0, w, h);
  			const pixels = imgData.data;
  			for (let i = 0; i < pixels.length; i += 4) {
  				if(pixels[i] !== 0){
  					const lightness = ~~(+((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3));
			    	pixels[i] = lightness, pixels[i + 1] = lightness, pixels[i + 2] = lightness;
			    }
			}
			ctx.putImageData(imgData, 0, 0);
        	ctx.globalAlpha=0.7;
        	ctx.globalCompositeOperation="overlay";
        	ctx.fillStyle="#7289DA";
        	// for (let y = 0; y < h; y++) {
	        // 	for (let x = 0; x < w; x++) {
	        // 		const cur = !y ? x : (!x ? y : x*y);
	        // 		if((pixels[cur*4+3] + pixels[cur*4+2] + pixels[cur*4+1] + pixels[cur*4]) === 0){
	        // 			ctx.fillStyle="#7289DA";
	        // 			ctx.fillRect(x, y, 1, 1)
	        // 		}
	        // 	}
	        // }
        	ctx.fillRect(0,0,w,h);
        	return ctx;
		}
		img.onload = async() => {
			const w = img.width, h = img.height;
			const Canvas = canvas.createCanvas(w, h);
			const ctx = Canvas.getContext('2d');
			if(/\.gif/.test(url)){
				console.log(img.src)
		      	const gifenc = require('gifencoder');
				const imageFrames = await require('gif-frames')({
					url,
					frames: "all",
					outputType: 'canvas'
				});
				const gif = new gifenc(w, h);
			    gif.start();
			    gif.setRepeat(0);
			    gif.setFrameRate(1000 / imageFrames[0].frameInfo.delay);
			    gif.setQuality(10)
			    // gif.setTransparent([3, 3, 4, 255])
			    gif.setDispose(imageFrames[0].frameInfo.disposal);
				for (const frame of imageFrames) {
					//const imageFrame = await canvas.loadImage(await util.promisedStream(frame.getImage()));
					ctx.drawImage(frame, 0, 0, w, h);
					//delete imageFrame;
					blurple(ctx, w, h);
					ctx.globalAlpha=1;
					gif.addFrame(ctx);
					ctx.clearRect(0, 0, w, h);
				}
		      	gif.finish();
				return interaction.editReply({content: null,files: [{ name: `blurple-${Date.now()}.gif`, attachment: gif.out.getData()}]});
			}
			ctx.drawImage((await canvas.loadImage(url)), 0, 0);
			blurple(ctx, w, h);
			await interaction.editReply({content: null, files: [{ name: `blurple-${Date.now()}.png`, attachment: Canvas.toBuffer()}]});
		};
		img.src = url;
	}
}
