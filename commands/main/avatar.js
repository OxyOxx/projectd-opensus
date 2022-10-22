module.exports = {
	config: {
		name: 'avatar',
		category: 'main',
		cooldown: 2,
		aliases: ['ava', 'a'],
		description: 'Аватар пользователя.',
		usage: '<(@)пользователь/id> -<png/jpeg/gif/webp>'
	},
	run: async(bot, message, args) => {
		let type = args[1], url;
		const user = message.mentions.users.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x)) || message.author;
		if(user.id === message.author.id && !args[1]) type = args[0];
		if(type === '-png') url = user.avatarURL({size: 1024, extension: 'png'});
		else if(type === '-jpeg') url = user.avatarURL({size: 1024, extension: 'jpeg'});
		else if(type === '-gif') url = user.avatarURL({size: 1024, extension: 'png', dynamic: true});
		else if(type === '-webp') url = user.avatarURL({size: 1024, extension: 'webp'});
		else url = user.avatarURL({size: 1024, extension: 'png', dynamic: true});
		const emb = new bot.Embed({image: {url}})
		.setColor('#fffffe')
		.setTimestamp()
		.setAuthor({name: user.tag, url});
		if(type === '-gif' && !user.avatar.startsWith('a_')) emb.setFooter({text: `Не GIF аватар, отображён PNG`});
		return message.say({embeds: [emb]});
	}
};
