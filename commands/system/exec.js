module.exports = {
	config: {
		name: 'exec',
		category: 'system',
		cooldown: 0,
		aliases: ['shell', 'sh']
	},
	run: async(bot, message, args) => {
		if(!bot.client.config.owners.includes(message.author.id)) return;
    	if(!args[0]) return message.say('>  А где код собственно?');
		const { execSync } = require("child_process");
    	const str = args.join(' ');
    	const msg = await message.say('> Выполняю код...');
    	try {
    		const output = execSync(str)
    		msg.edit(`\`\`\`bash\n$ ${str}\n\n${output.toString().slice(0, 1900)}\`\`\``)
    	} catch(err) {
    		msg.edit(`\`\`\`bash\n$ ${str}\n\n${err.toString().slice(0, 1900)}\`\`\``)
    	}
    	
	}
};