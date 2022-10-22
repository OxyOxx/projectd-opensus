module.exports = {
	config: {
		name: 'color',
		category: 'fun',
		cooldown: 2,
		aliases: ['clr'],
		description: 'Отобразить случайный/указанный цвет',
		usage: '<#hex> <-pastel/-ext/-rgb>'
	},
	run: async(bot, message, args) => {
		const input = /[0-9A-Fa-f]{3,6}/.test(args[0]) ? args[0] : Math.random().toString(16).slice(2, 8).toUpperCase();
		if(args.includes('-pastel')) input = util.colors.randomPastel();
		// if(args.includes('-rgb')) input = args.remove('-rgb').join(' ').match(/[0-255]{3}/)[2] ? args.join(' ').match(/[0-255]{3}/) : `${Math.random().toString(16).slice(2, 8).toLowerCase()}`;
		// if(input?.[0] === '-' || input?.[0] !== '-' && !/[0-9A-Fa-f]{6}/g.test(input)) input = `${Math.random().toString(16).slice(2, 8).toLowerCase()}`
		const data = util.colors.parser(input);
		const emb = new bot.Embed()
		.setColor(`#${data.hex}`)
		.setThumbnail(`http://www.singlecolorimage.com/get/${data.hex}/64x64`)
		.setDescription(`HEX: **\`#${data.hex}\`**\nRGB: **\`${data.rgb.join(', ')}\`**\nDEC: **\`${data.dec}\`**\nHSL: **\`${data.hsl.join(', ')}\`**\nCMYK: **\`${data.cmyk.join(', ')}\`**\nXYZ: **\`${data.xyz.join(', ')}\`**`)
		.setTimestamp();
		//const colors = require('../../colors.json').colors;
		//const upHex = data.hex.toUpperCase();
		// if(data.pantone) emb.setTitle(data.pantone?.[2]||colors.filter(x => x[0] === data.pantone[1])[0]?.[2]||data.pantone[1] : data.pantone[0]).setURL(`https://icolorpalette.com/color/${data.pantone[2] ? data.pantone[0] : data.pantone[1]}`).setFooter({text: data.pantone[2] ? data.pantone[1] : null})
		// 	else if(!data.pantone){
		// 		const icolorp = await fetch(`https://icolorpalette.com/color/${data.hex}`);
		// 		const name = icolorp.match(/<h1 class="mt-2 entry-title">.*<small>/g)[0].replace(/<[^>]*>/g, '').trim();
		// 		if(!colors.filter(x => x === upHex)[0]){
		// 			colors.push([upHex, (await fetch(`https://icolorpalette.com/color/${name.replace(' ', '-')}`)).match(/#[0-9A-Fa-f]{6}/g)[0].toUpperCase()]);
		// 			require('fs').writeFile('colors.json', JSON.stringify({colors}), 'utf8', (err) => err ? console.error(err) : true);
		// 		} 
		// 		emb.setTitle(`± ${name}`).setURL(`https://icolorpalette.com/color/${data.hex}`)
		// 	}
		message.say({embeds: [emb]})
	}
};
