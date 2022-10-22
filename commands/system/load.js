module.exports = {
	config: {
		name: 'load',
		category: 'system',
		cooldown: 0,
		aliases: ['lcmd']
	},
	run: async(bot, message, args) => {
		if(!bot.client.config.owners.includes(message.author.id)) return;
		if(!args[0]) return message.say('> Где категория?');
		if(!args[1]) return message.say('> А где название команды?');
		if(bot.client.commands.has(args[1])) return message.say('> Такая команда уже загружена.')
		try {
			const cmd = require(`../${args[0]}/${args[1]}.js`);
			if(!cmd) return message.say('> Я не нашёл такую команду.');
			bot.client.commands.set(args[1], cmd);
			message.say(`> Команда **\`${args[1]}\`** загружена.`);
		} catch (err) {
			message.say(`\`\`\`js\n${err.toString().slice(0, 512)}\n\`\`\``)
		}
	}
};