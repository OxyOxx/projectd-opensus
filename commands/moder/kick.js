module.exports = {
	config: {
		name: 'kick',
		category: 'moder',
		cooldown: 2,
		description: 'Кикнуть участника.',
		aliases: ['kk'],
		usage: '[участник/его ID] <причина>'
	},
	run: async(bot, message, args) => {
		//return message.say('> На переделке, скоре будет... или же нет.')
		const emb = new bot.Embed().setColor('#fffffe').setTimestamp();
		if(!message.member.permissions.has('KICK_MEMBERS')) return message.say({embeds: [emb.setTimestamp().setDescription(`У тебя нету права на __Выгон участников__.`)]});
		if(!message.guild.me.permissions.has('KICK_MEMBERS')) return message.say({embeds: [emb.setTimestamp().setDescription(`У меня нету права на __Выгон участников__.`)]});
		if(!args[0]) return message.say({embeds: [emb.setDescription(`Укажите участника.`)]});
		const reason = args.slice(1).join(' ') || 'Не указана.';
		const member = message.mentions.members.first() || await util.getUser(args, bot.client, message.guild.members.cache.map(x => x), false);
		if(!member || !message.guild.members.cache.has(member?.id || member?.user?.id)) return message.say({embeds: [emb.setDescription(`Укажите существующего участника.`)]});
		if(member?.user?.id === bot.client.user.id) return message.say({embeds: [emb.setDescription(`Я не могу кикнуть себя :(`)]});
		if(member?.user?.id === message.author.id) return message.say({embeds: [emb.setDescription(`Я не могу кикнуть тебя :(`)]});
		if(member.roles.highest.rawPosition >= message.guild.me.roles.highest.rawPosition) return message.say({embeds: [emb.setDescription(`Я не могу кикнуть указаного участника.`)]});
		if(!member.kickable) return message.say({embeds: [emb.setDescription(`Я не могу кикнуть указаного участника.`)]});
		let id = '', cur = 0;
		const chr = 'abcdefghijklmnopqrstuvwxyz0123456789';
		for(let i = 0; i < 6; i++) id += chr[~~(Math.random() * chr.length)];
		const row = new Discord.ActionRowBuilder({
						components: [new Discord.ButtonBuilder({customId: `dec-${id}`, label: 'Нет', style: 2}),
							new Discord.ButtonBuilder({customId: `acc-${id}`, label: 'Да', style: 4})]
					});
		const msg = await message.say({components: [row], embeds: [emb.setDescription(`Вы точно хотите кикнуть ${member} ?`)]});
      	msg.duse = true;
      	const filter = (i) => {
        	return i.customId.includes(`-${id}`) && i.user.id === message.author.id;
      	};
      	const collector = message.channel.createMessageComponentCollector({filter, time: 30000});
      	collector.on('collect', async i => {
	        if(i.customId.includes('acc')){
	          msg.duse = false;
	          await msg.edit({embeds: [emb.setDescription(`**\`${member.user.tag}\`** кикнут.`)]});
	          await member.send({embeds: [emb.setDescription(`Вы были кикнуты с **\`${message.guild.name}\`**, причина: **\`${reason}\`**.`)]});
	          member.kick(reason);
	          collector.stop();
	        } else if(i.customId.includes('dec')){
	          msg.duse = false;
	          await msg.edit({embeds: [emb.setDescription(`${member} не будет кикнут.`)]});
	          collector.stop();
	        }
      });
      collector.on('end', () => {
        if(msg.duse) msg.edit({embeds: [emb.setDescription('Время на выбор вышло.')], components: []})
        	else msg.edit({components: []})
      })
	}
};
