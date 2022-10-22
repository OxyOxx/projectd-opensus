module.exports = {
	config: {
		name: 'petpet',
		category: 'fun',
		cooldown: 5,
	 	aliases: ['pp'],
		description: 'Анимированая рука начнёт гладить картинку.',
		usage: '<(@)пользователь/id/url>'
	},
	run: async(bot, message, args) => {
		const emb = new bot.Embed()
		.setColor('#fffffe')
		.setTimestamp();
		const url = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif))/i.test(args[0]) ? args[0] : (message.attachments.first()?.url || (message.mentions.users.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x)) || message.author).avatarURL({size: 256, extension: 'png'}));
		if(!url) return message.say({embeds: [emb.setDescription('Извиняюсь, но, похоже, я не могу найти картинку в вашем запросе...')]});
		message.channel.sendTyping();
		const gif = await require('../../utils/petpet.js')(url);
		// delete global.remaining;
		// delete global.curPixel;
		// delete global.n_bits;
		message.say({files: [{ name: `petpet-${Date.now()}.gif`, attachment: gif}]});
	}
};
