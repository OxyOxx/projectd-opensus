module.exports = {
	data: {
		name: 'reminds',
		description: 'напоминания!!!',
		options: [{
			type: 1,
			name: 'view',
			description: 'Посмотреть напоминания',
			options: [{
				type: 3,
  				name: 'id',
  				description: 'ID напоминания'
  			}]
		},
		{
			type: 1,
			name: 'add',
			description: 'Добавить напоминание',
			options: [{
				type: 3,
  				name: 'текст',
  				description: 'Текст для напоминания',
  				required: true
  			},
			{
				choices: [{name: 'мне', value: '1'},
						{name: 'сюда', value: '0'}],
	  			type: 3,
	  			name: 'куда',
	  			description: 'Куда отправить напоминание',
	  			required: true
	  		},
			{
				type: 3,
	  			name: 'когда',
	  			description: 'Дата напоминания',
	  			required: true
	  		}]
		},
		{
			type: 1,
			name: 'delete',
			description: 'Удалить напоминание',
			options: [{
				type: 3,
  				name: 'id',
  				description: 'ID напоминания',
  				autocomplete: true,
  				required: true
  			}]
		},]
		
	},
	async run(bot, interaction){
		const emb = new bot.Embed({color: 16777215, author: {name: 'Напоминания', iconURL: interaction.user.avatarURL({format: 'png', dynamic: true})}}).setTimestamp();
		if(interaction.options._subcommand === 'view'){
			
			const id = interaction.options.getString('id');
			const data = await bot.db.remind.find(id ? {id} : {});
			if(!data[0] && !id) return interaction.reply({embeds: [emb.setDescription(`Упс, я ничего не смог найти. Может, стоит добавить напоминание?`)], ephemeral: true});
			if(!data[0] && id) return interaction.reply({embeds: [emb.setDescription(`Напоминание с ID **\`${id}\`** не найдено.`)], ephemeral: true});
			if(data[0] && id) return interaction.reply({ephemeral: true, embeds: [emb.setDescription(`${require('moment').utc(data[0].date).format(`**\`DD.MM.YYYY, HH:mm:ss\`**`)} - **\`${data[0].id}\`**\n\`\`\`${data[0].text}\`\`\``)]})
			let desc = '';
			const now = Date.now();
			for(let i = 0; i < data.length; i++){
				desc += `**${i+1}**. <t:${~~(data[i].date/1000)}:f> - **\`${data[i].id}\`**\n\`\`\`${data[i].text}\`\`\`\n`;
			}

			return interaction.reply({ephemeral: true, embeds: [emb.setDescription(desc)]});
		} else if(interaction.options._subcommand === 'delete'){
			const id = interaction.options.getString('id');

			const remind = await bot.db.remind.findOne({id});

			emb.setFooter({text: `ID: ${id}`})
			.setDescription(`Вы точно хотите удалить напоминание на <t:${~~(remind.date/1000)}:f>?\n\`\`\`${remind.text}\`\`\``);

			const buttons = new Discord.ActionRowBuilder({
				components: [new Discord.ButtonBuilder({customId: `decline-${id}`, label: 'Оставить', style: 4}),
							new Discord.ButtonBuilder({customId: `accept-${id}`, label: 'Удалить', style: 1})]
			});

			await interaction.reply({ephemeral: true, components: [buttons], embeds: [emb]});
			const filter = i => i.customId.split('-')[1]===id||i.deferUpdate();
			const collector = interaction.channel.createMessageComponentCollector({filter, timeout: 90000});
			collector.on('collect', async i => {
				if(i.customId.split('-')[1] !== id) return;
				await ({
					'accept': async() => {
						pressed = true;
						clearTimeout(bot.reminds.get(id))
						bot.reminds.delete(id)
						await bot.db.remind.deleteOne({id});
						await interaction.editReply({components: [], embeds: [emb.setDescription(`Напоминание на <t:${~~(remind.date/1000)}:f> удалено.`)]});
						collector.stop();
					},
					'decline': async() => {
						pressed = true;
						emb.setDescription(`Напоминание оставлено.`);
						await interaction.editReply({components: [], embeds: [emb]});
						collector.stop();
					}
				})[i.customId.split('-')[0]]();
			});
			collector.on('end', () => {
				if(!pressed) interaction.editReply({components: [], embeds: [emb.setDescription('Время на ответ вышло, напоминание оставлено.')]})
			})
		} else if(interaction.options._subcommand === 'add'){
			const text = interaction.options.getString('текст'),
			to = interaction.options.getString('куда'),
			date = interaction.options.getString('когда');

			const daterx = /(\d{2})\.(\d{2})\.(\d{4}|\d{2})|(\d{2})\:(\d{2})\:(\d{2})|(\d{2})\:(\d{2})/g, time = /\d+([dhmsдчмс])/g;
			const now = nowto = new Date();

			let timeout = 0;
			if(daterx.test(date)){
				console.log(nowto)
				for(const d of date.match(daterx)){
					if(/(\d{2})\.(\d{2})\.(\d{4}|\d{2})/g.test(d)){
						let [day, month, year] = d.split('.');
						if(year.length === 2) year = '20'+year;
						if(+day < now.getDate() && +month-1 < now.getMonth() && +year <= now.getFullYear()) continue;

						if(day < 32 && day > 0) nowto.setDate(day);
						if(month < 13 && month > 0) nowto.setMonth(month-1);
						if(year < now.getFullYear() + 4) nowto.setFullYear(year);

					} else if(/(\d{2})\:(\d{2})\:(\d{2})|(\d{2})\:(\d{2})/g.test(d)){
						const [hours, minutes, seconds] = d.split(':');

						if(hours < 24 && hours > -1) nowto.setHours(hours);
						if(minutes < 60 && minutes > -1) nowto.setMinutes(minutes);
						if(seconds < 60 && seconds > -1) nowto.setSeconds(seconds||0)
					}
				}
				timeout += nowto.getTime() - now.getTime();
			}
			if(time.test(date)){
				const m = {
					d: 86400000,
					h: 3600000,
					m: 60000,
					s: 1000,
					д: 86400000,
					ч: 3600000,
					м: 60000,
					с: 1000
				};
				for(const d of date.match(time)) timeout += ~~(m[d.at(-1)] * +d.match(/\d+/g)[0]);
			}
			if(!timeout) return interaction.reply({embeds: [emb.setDescription(`Видимо, вы указали слишком недалёкую дату для напоминания.`)], ephemeral: true})
			const dt = now.getTime() + timeout;
			let id = '';
			const chr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for(let i = 0; i < 6; i++) id += chr[~~(Math.random() * chr.length)];
			
			const data = await bot.db.remind.create({
				id,
				text,
				user: interaction.user.id,
				sendTo: +to ? `user-${interaction.user.id}` : `channel-${interaction.channel.id}`,
				date: dt
			})
			bot.reminds.set(id, setTimeout(async() => {
				const remind = await bot.db.remind.findOne({id: data.id});
				const [c,id] = remind.sendTo.split('-');
				const channel = c === 'channel' ? bot.client.channels.cache.get(id) : bot.client.users.cache.get(id);
				await channel.send({
					content: `<@${remind.user}>`,
					embeds: [new bot.Embed({color: 16777215, author: {name: 'Напоминание', iconURL: interaction.user.avatarURL({format: 'png', dynamic: true})}, description: `\`\`\`${text}\`\`\``}).setTimestamp()]
				});
				await bot.db.remind.deleteOne({id: data.id});
				bot.reminds.delete(id)
			}, dt - Date.now()))
			interaction.reply({ephemeral: true, content: `Я напомню ${+to ? 'тебе' : 'сюда'} об этом <t:${~~(dt/1000)}:f>`})
		}
		
	}
}
