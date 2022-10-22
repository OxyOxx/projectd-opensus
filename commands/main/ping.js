module.exports = {
	config: {
		name: 'ping',
		category: 'main',
		cooldown: 4,
		aliases: ['pong', 'latency'],
		description: 'Пинг бота.'
	},
	run: async(bot, message, args) => {
		let msg = 'Pong!';
		if(message.content.split(/ +/g)[0].slice(message.guild.data.prefix.length) === 'pong') msg = 'Ping!';
		const emb = new bot.Embed()
		.setColor('#fffffe')
		.setTimestamp()
		.setDescription(`**${msg}** Мой пинг: **\`${bot.client.ws.ping}\`**`)
		return message.say({embeds: [emb]})
	}
};