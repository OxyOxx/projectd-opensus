module.exports = {
	config: {
		name: 'reload',
		category: 'system',
		cooldown: 0,
		aliases: ['rcmd']
	},
	run: async(bot, message, args) => {
		if(!bot.client.config.owners.includes(message.author.id)) return;
		if(!args[0]) return message.say('> А где название команды?');
		if(args[0] === 'all'){
			bot.client.commands.map(x => {
				bot.client.commands.delete(x.config.name);
				delete require.cache[require.resolve(`../${x.config.category}/${x.config.name}.js`)];
				const cmd = require(`../${x.config.category}/${x.config.name}.js`);
				bot.client.commands.set(args[0], cmd)
			})
			return message.say(`> Все команды были успешно перезагружены.`);
		}
		if(!bot.client.commands.has(args[0])) return message.say('> Такая команда не загружена.')
		const {name, category} = bot.client.commands.get(args[0]).config;
		bot.client.commands.delete(args[0]);
		delete require.cache[require.resolve(`../${category}/${name}.js`)];
		try{
			const reloaded = require(`../${category}/${name}.js`);
			bot.client.commands.set(args[0], reloaded);
			message.say(`> Команда **\`${args[0]}\`** перезагружена.`)
		} catch (err) {
			message.say(`\`\`\`js\n${err.toString().slice(0, 512)}\n\`\`\``)
		}
	}
};