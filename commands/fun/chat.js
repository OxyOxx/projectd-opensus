const fetch = require('../../utils/fetch.js');
module.exports = {
	config: {
		name: 'chat',
		category: 'fun',
		cooldown: 30,
		aliases: ['dialog'],
		description: 'Бот начнёт с вами болтать.'
	},
	run: async(bot, message, args) => {
		const emb = new bot.Embed().setColor('#fffffe').setTimestamp();
		if(message.channel?.dialog === true) return message.say({embeds: [emb.setDescription('В этом канале активен один диалог, дождитесь его конца.')]})
		message.say({embeds: [emb.setDescription(`Разговор начался, просто пишите что-то в чат (отвечает только на сообщения **\`${message.author.tag}\`**)\nДля остановки диалога напишите **\`${message.guild.data.prefix}stop\`**`)]});
		const filter = m => {
			return m.content !== null && m.author.id === message.author.id && m.channel.id === message.channel.id;
		};
		const cd = new Set();
		const collector = message.channel.createMessageCollector({filter, idle: 90000});
		bot.client.channels.cache.get(message.channel.id).dialog = true;
		collector.on('collect', async m => {
			if(m.content === `${message.guild.data.prefix}stop`){
				collector.stop()
			} else if(![`${message.guild.data.prefix}chat`, `${message.guild.data.prefix}dialog`].includes(m.content)){
				if(cd.has(message.author.id)) return m.react('733734783078760762');
				message.channel.sendTyping();
				const data = await fetch('https://xu.su/api/send', {method: 'POST', json: {
					bot: 'Владик',
					text: m.content
				}})
				if(data.ok){
					cd.add(message.author.id);
					message.say(data.text.toString());
					setTimeout(() => {
            			cd.delete(message.author.id);
        			}, 1000);
				}
			}
		})
		collector.on('end', (m) => {
			bot.client.channels.cache.get(message.channel.id).dialog = false;
			message.say({embeds: [new bot.Embed().setColor(['#fffffe']).setTimestamp().setDescription(`Диалог был завёршен, бот больше не отвечает на ваши сообщения (всего было отправлено вами **\`${m.size}\`**)`)]})
	})
}
};
