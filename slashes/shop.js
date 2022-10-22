module.exports = {
	data: {
		name: 'shop',
		description: 'Магазин',
		description_localizations: {
			'en-US': 'Shop'
		}
	},
	async run(bot, interaction) {
		if(bot.game.invcds.has(interaction.user.id+'-1')){
			const cd = bot.game.invcds.get(interaction.user.id+'-1');
			cd.stop();
		}
		const user = await bot.db.user.findOne({id: interaction.user.id});

		const list = [...Object.keys(bot.game.items), ...Object.keys(bot.game.boxes)].filter(x => x!=='Box').map(x => bot.game.resolve(x)).filter(x => x.flags.has('BUYABLE'));
		let desc = '', options = [], current;
		for(const item of list){
			desc += `**\`${`${item.prices[0]}`.padEnd(4, ' ')} ¥\`** ${item.emoji} ${item.name}\n`;
			options.push({emoji: item.emoji, label: item.name, description: item.description, value: item.id+'-1'});
		}
		const emb = new bot.Embed({color: 16777215,
			title: interaction.locale === 'ru' ? 'расея вперде 🇳🇱🇳🇱🇳🇱' : null,
			footer: {text: `Баланс: ${user.money.toLocaleString()} ¥`},
			author: {name: `${interaction.user.tag} | Магазин`, iconURL: interaction.user.avatarURL({format: 'png', dynamic: true})},
			description: desc});

		const menu = new Discord.ActionRowBuilder({
			components: [new Discord.SelectMenuBuilder({customId: 'shop_select', placeholder: 'Выбрать товар', options})]
		}), back = new Discord.ActionRowBuilder({
			components: [new Discord.ButtonBuilder({customId: 'back_shop', label: 'Вернуться', style: 2})]
		});
		//['shop_select', 'count_shop', 'shop_buy', 'back_shop'].includes(i.customId)
		await interaction.reply({embeds: [emb], components: [menu], ephemeral: true});
		const reply = await interaction.fetchReply();
		//const filter = i => i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({idle: 120000});
		bot.game.invcds.set(interaction.user.id+'-1', collector);
		const actions = {
			'count_shop': async(i) => {
				const c = i.message.components;
				c[0].components[0].options.find(x => x.default).default = false;
				c[0].components[0].options.find(x => x.value === i.values[0]).default = true;
				await i.update({components: c});
			},
			'back_shop': async(i) => {
				emb.setTimestamp()
				.setFooter({text: `Баланс: ${user.money.toLocaleString()} ¥`})
				.setDescription(desc);

				await i.update({embeds: [emb], components: [menu]})
			},
			'shop_select': async(i) => {
				current = bot.game.resolve(i?.values?.[0].split('-')[0]);
				emb.setTimestamp()
				.setDescription(`${current.emoji} ${current.name}\n${current.description}\nЦена – **\`${current.prices[0].toLocaleString()} ¥\`**`)
				.setFooter({text: `ID: ${current.id}`});

				const canBuy = ~~(user.money / current.prices[0]) > 10 ? 10 : ~~(user.money / current.prices[0]);

				if(canBuy === 0) return await i.update({embeds: [emb], components: [back]});
				const total = ~~(user.money / current.prices[0]);
				const options = [];
				for(let i = 1; i < canBuy+1; i++){
					options.push({emoji: util.consts.emojiNum[i-1], label: current.name, description: `Ты купишь x${i} ${current.name}`, value: `buy_${i}`, default: !(i-1)})
				}
				if(total > 10) options.push({emoji: '🔢', label: 'Всё', description: `Ты купишь x${total} ${current.name}`, value: `buy_${total}`});
				const count = new Discord.ActionRowBuilder({
					components: [new Discord.SelectMenuBuilder({customId: 'count_shop', placeholder: 'Выбери кол-во', options})]
				}), buy = new Discord.ActionRowBuilder({
					components: [new Discord.ButtonBuilder({customId: 'back_shop', label: 'Вернуться', style: 2}),
					new Discord.ButtonBuilder({customId: 'shop_buy', label: 'Купить', style: 1})]
				});

				await i.update({embeds: [emb], components: [count, buy]})
			},
			'shop_buy': async(i) => {
				const count = +i.message.components[0].components[0].options.find(x => x.default).value.split('_')[1];

				user.money -= count * current.prices[0];
				user.items.has(current.id) ? user.items.set(current.id, user.items.get(current.id) + count) : user.items.set(current.id, count);
				await user.save();
				emb.setTimestamp()
				.setFooter({text: `Баланс: ${user.money.toLocaleString()} ¥`})
				.setDescription(`Куплено **\`x${count}\`** ${current.emoji} ${current.name} за **\`${(count*current.prices[0]).toLocaleString()} ¥\`**\n— Спасибо за покупку!`);

				await i.update({embeds: [emb], components: [back]})
			}
		}
		collector.on('collect', async i => {
			if(interaction.commandName === i.message.interaction.commandName && i.message.id === reply.id && i.user.id === interaction.user.id) {
				if(actions[i.customId]) await actions[i.customId](i).catch(console.error);
			} else if(i.message.id !== reply.id) return true
			else i.reply({ephemeral: true, content: ':skull:'});
		});
		collector.on('end', async() => {
			bot.game.invcds.delete(interaction.user.id+'-1');
			await interaction.editReply({embeds: [emb], components: []});
		});
	}
}
