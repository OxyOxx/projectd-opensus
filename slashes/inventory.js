module.exports = {
	data: {
		name: 'inventory',
		description: 'Вызвать свой инветарь'
	},
	async run(bot, interaction) {
		const emb = new bot.Embed({
			title: interaction.locale === 'ru' ? 'расея вперде 🇳🇱 🇳🇱 🇳🇱' : null,
			color: 16777215,
			author: {name: `${interaction.user.username} | Инвентарь`, iconURL: interaction.user.avatarURL({format: 'png', dynamic: true})}
		}).setTimestamp();

		if(bot.game.invcds.has(interaction.user.id)){
			const cd = bot.game.invcds.get(interaction.user.id);
			cd.stop();
		}

		const user = await bot.db.user.findOne({id: interaction.user.id}), rd = [], keys = [];

		for(const k of user.items.keys()){
			if(user.items.get(k) !== 0) keys.push(k);
		};
		if(!keys[0]) return interaction.reply({embeds: [emb.setDescription(`Твой инвентарь пуст.`)]});
		let id = '';
		const chr = 'abcdefghijklmnopqrstuvwxyz0123456789';
		for(let i = 0; i < 6; i++) id += chr[~~(Math.random() * chr.length)];
		let desc = '';
		for(const i of keys){
			const item = bot.game.resolve(i);
			desc += `**\`${`x${user.items.get(i)}`.padStart(4, ' ')}\`** ${item?.emoji?item.emoji+' ':''}${item.name}\n`
			rd.push({emoji: item.emoji, label: item.name, description: item.description, value: `${item.id}-${id}`})
		}
		emb.setDescription(desc);
		const row = new Discord.ActionRowBuilder({
			components: [new Discord.SelectMenuBuilder({customId: `inventory_select-${id}`, placeholder: 'Выбрать предмет', options: rd})]
		}), back = new Discord.ActionRowBuilder({
			components: [new Discord.ButtonBuilder({customId: `back-${id}`, label: 'Вернуться', style: 2})]
		}), backitem = new Discord.ActionRowBuilder({
			components: [new Discord.ButtonBuilder({customId: `item_back-${id}`, label: 'Вернуться', style: 2})]
		});

		await interaction.reply({embeds: [emb], components: [row], ephemeral: false});
		const reply = await interaction.fetchReply();
		const collector = interaction.channel.createMessageComponentCollector({idle: 120000});
		bot.game.invcds.set(interaction.user.id, collector);
		let current;
		const actions = {
			async count(i) {
				const c = i.message.components;
				c[0].components[0].options.find(x => x.default).default = false;
				c[0].components[0].options.find(x => x.value === (i.values[0] + `-${id}`)).default = true;
				await i.update({components: c});
			},
			async inventory_select(i, skip = true) {
				if(skip) current = bot.game.resolve(i?.values?.[0]);
				const user = await bot.db.user.findOne({id: i.user.id});
				emb.setFooter({text: `ID: ${current.id}`}).setTimestamp()
				.setDescription(`**\`x${user.items.get(current.id)}\`** ${current.emoji} **\`${current.name}\`**\n${current.description}`)
				.setAuthor({name: `${i.user.username} | Предмет`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})});

				if(current.flags.has('Item')){
					let opt = [];
					if(current.flags.has('Usable')) opt.push({emoji: '📦', label: 'Использовать', description: `Использовать ${current.name}`, value: `use_${current.id}-${id}`})
					if(current.flags.has('Craftable')) opt.push({emoji: '⚒️', label: 'Сделать', description: `Сделать ${bot.game.resolve(current.recipes[0]).name}`, value: `make_${current.id}-${id}`});
					if(current.flags.has('Removable')) opt.push({emoji: '🗑️', label: 'Удалить', description: `Удалить ${current.name} из инвентаря`, value: `remove_${current.id}-${id}`});
					if(current.flags.has('Event')) opt = [];

					const action = new Discord.ActionRowBuilder({
						components: [new Discord.SelectMenuBuilder({customId: `item_action-${id}`, placeholder: 'Выбрать действие', options: opt})]
					});

					return await i.update({embeds: [emb], components: opt[0] ? [action, back] : [back]});
				} else if(current.flags.has('Box')){
					const rd = [];
					const nowCount = user.items.get(current.id) > 10 ? 10 : user.items.get(current.id);
					for(let i = 0; i < nowCount; i++){
						rd.push({emoji: util.consts.emojiNum[i], label: 'Ящиков', description: `Ты откроешь ${i+1} ящиков`, value: `box_${i+1}-${id}`, default: i === 0 ? true: false})
					}
					if(user.items.get(current.id) > 10) rd.push({emoji: '🔢', label: 'Все', description: `Ты откроешь ${user.items.get(current.id)} ящиков`, value: `box_${user.items.get(current.id)}-${id}`})
					const list = new Discord.ActionRowBuilder({
						components: [new Discord.SelectMenuBuilder({customId:`count-${id}`, placeholder: 'Количество', options: rd})]
					}), buttons = new Discord.ActionRowBuilder({
						components: [new Discord.ButtonBuilder({customId: `boxes_open-${id}`, label: 'Открыть', style: 1}),
							new Discord.ButtonBuilder({customId: `back-${id}`, label: 'Вернуться', style: 2})]
					});
					
					return await i.update({embeds: [emb], components: [list, buttons]});
				};
			},
			async boxes_open(i) {
				const count = i.message.components[0].components[0].options.find(x => x.default).value.split('_')[1].split('-')[0];
				const rew = current.open(+count);
				const k = Object.keys(rew);
				const before = user.items.get(current.id);
				if(before === +count) user.items.delete(current.id)
					else user.items.set(current.id, before - count);
				let des = '';
				for(const r of k){
					const reward = bot.game.resolve(r);
					des += `**\`${`x${rew[r]}`.padStart(4, ' ')}\`** ${reward?.emoji?reward.emoji+' ':''}${reward.name}\n`
					if(r === 'money') user.money += rew[r]
						else user.items.has(r) ? user.items.set(r, user.items.get(r) + rew[r]) : user.items.set(r, rew[r]);
				}
				await user.save();
				
				emb.setTimestamp().setFooter({text: `${current.name}: x${before} => x${before === +count ? 0 : user.items.get(current.id)} | ID: ${current.id}`})
				.setAuthor({name: `${i.user.username} | Ящик`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})})
				.setDescription(`Ты открыл **\`x${count}\`** ${current.emoji} **${current.name}** и получил:\n${des}`); //.padStart(4, ' ')
				
				await i.update({embeds: [emb], components: [user.items.get(current.id) ? backitem : back]});
			},
			async back(i) {
				const user = await bot.db.user.findOne({id: interaction.user.id});
				
				const keys = [];
				for(const k of user.items.keys()){
					if(user.items.get(k) !== 0) keys.push(k);
				};
				if(!keys[0]) {
					i.update({embeds: [emb.setDescription(`Твой инвентарь пуст.`)]});
					return collector.stop();
				} 
				let desc = '';
				const rd = [];
				for(const id of keys){
					const item = bot.game.resolve(id);
					desc += `**\`${`x${user.items.get(id)}`.padStart(4, ' ')}\`** ${item.emoji+' '??''}${item.name}\n`
					rd.push({emoji: item.emoji, label: item.name, description: item.description, value: item.id})
				}
				const row = new Discord.ActionRowBuilder({
					components: [new Discord.SelectMenuBuilder({customId: `inventory_select-${id}`, placeholder: 'Выбрать предмет', options: rd})]
				});
				emb.setTimestamp().setFooter(null).setDescription(desc)
				.setAuthor({name: `${i.user.username} | Инвентарь`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})});

				await i.update({embeds: [emb], components: [row]})
			},
			async item_action(i) {
				const action = i.values[0].split('_')[0];
				const actions = {
					async remove() {
						if(current.flags.has('Hidden') || !current.flags.has('Removable')) return false;
						const user = await bot.db.user.findOne({id: i.user.id});
						const total = user.items.get(current.id);
						emb.setTimestamp().setFooter({text: `Всего: x${total} | ID: ${current.id}`})
						.setAuthor({name: `${i.user.username} | Удаление`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})})
						.setDescription(`Ты действительно хочешь удалить ${current.emoji} **\`${current.name}\`**?`);

						const rd = [];
						const nowCount = total > 10 ? 10 : total;
						for(let i = 1; i < nowCount+1; i++){
							rd.push({emoji: util.consts.emojiNum[i-1], label: 'Предметов', description: `Ты удалишь x${i} ${current.name}`, value: `remove_${i}-${id}`, default: i === 1 ? true: false})
						}
						if(user.items.get(current.id) > 10) rd.push({emoji: '🔢', label: 'Все', description: `Ты удалишь x${user.items.get(current.id)} ${current.name}`, value: `remove_${user.items.get(current.id)}-${id}`});
						
						const rowList = new Discord.ActionRowBuilder({
							components: [new Discord.SelectMenuBuilder({customId: `count-${id}`, placeholder: 'Количество', options: rd})]
						}), buttons = new Discord.ActionRowBuilder({
							components: [new Discord.ButtonBuilder({customId: `item_back-${id}`, label: 'Вернуться', style: 2}),
								new Discord.ButtonBuilder({customId: `item_remove-${id}`, label: 'Удалить', style: 4})]
						})

						await i.update({embeds: [emb], components: [rowList, buttons]});
					},
					async make() {
						if(current.flags.has('HIDDEN') || !current.flags.has('CRAFTABLE')) return false;
						const user = await bot.db.user.findOne({id: i.user.id});
						const wmake = bot.game.resolve(current.recipes[0]);
						const total = user.items.get(current.id);
						const canMake = ~~(total / wmake.prices[1]) > 10 ? 10 : ~~(total / wmake.prices[1]);
						const buttons = new Discord.ActionRowBuilder({
							components: [new Discord.ButtonBuilder({customId: `item_back-${id}`, label: 'Вернуться', style: 2})]
						});
						emb.setTimestamp().setFooter({text: `Всего: x${total} | ID: ${current.id}`})
							.setAuthor({name: `${i.user.username} | Создание`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})})
							.setDescription(`${wmake.emoji} **${wmake.name}**\n${wmake.description}\n**\`x${wmake.prices[1]}\`** ${current.emoji} **\`${current.name}\`** для **\`x1\`** ${wmake.emoji} **\`${wmake.name}\`**`);

						if(canMake === 0) return await i.update({embeds: [emb], components: [buttons]});
						const rd = [];
						for(let i = 1; i < canMake+1; i++){
							rd.push({emoji: util.consts.emojiNum[i-1], label: wmake.name, description: `Ты сделаешь x${i} ${wmake.name}`, value: `make_${i}-${id}`, default: i === 1 ? true: false})
						}
						if(user.items.get(current.id) > (10 * wmake.prices[1])) rd.push({emoji: '🔢', label: 'Все', description: `Ты сделаешь x${~~(user.items.get(current.id) / wmake.prices[1])} ${wmake.name}`, value: `make_${~~(user.items.get(current.id) / wmake.prices[1])}-${id}`});
						const list = new Discord.ActionRowBuilder({
							components: [new Discord.SelectMenuBuilder({customId: `count-${id}`, placeholder: 'Количество', options: rd})]
						})

						buttons.components.push(new Discord.ButtonBuilder({customId: `item_make-${id}`, label: 'Сделать', style: 1}));

						await i.update({embeds: [emb], components: [list, buttons]});
					},
					async use() {
						const user = await bot.db.user.findOne({id: i.user.id});
						const total = user.items.get(current.id);
						const wuse = bot.game.resolve(current.usage[0]);
						const num = total > 10 ? 10 : total;
						const buttons = new Discord.ActionRowBuilder({
							components: [new Discord.ButtonBuilder({customId: `item_back-${id}`, label: 'Вернуться', style: 2}),
								new Discord.ButtonBuilder({customId: `item_use-${id}`, label: 'Использовать', style: 1})]
						});

						emb.setTimestamp().setFooter({text: `Всего: x${total} | ID: ${current.id}`})
							.setAuthor({name: `${i.user.username} | Использование`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})})
							.setDescription(`${current.emoji} **${current.name}**\n${current.description}\n**\`x1\`** **${current.name}** для **\`x${current.usage[1]}\`** ${wuse.emoji} **${wuse.name}**`);

						const rd = [];
						for(let i = 1; i < num+1; i++){
							rd.push({emoji: util.consts.emojiNum[i-1], label: current.name, description: `Ты используешь x${i} ${current.name} для x${i*current.usage[1]}`, value: `use_${i}-${id}`, default: i === 1 ? true: false})
						};
						if(total > 10) rd.push({emoji: '🔢', label: 'Все', description: `Ты используешь x${total} ${current.name}`, value: `use_${total}-${id}`});
						
						const list = new Discord.ActionRowBuilder({
							components: [new Discord.SelectMenuBuilder({customId: `count-${id}`, placeholder: 'Количество', options: rd})]
						});

						await i.update({embeds: [emb], components: [list, buttons]});
					} 
				}
				await actions[action](i);
			},
			async item_make(i) {
				const count = +i.message.components[0].components[0].options.find(x => x.default).value.split('_')[1];
				const wmake = bot.game.resolve(current.recipes[0]);
				const before = user.items.get(current.id);
				const beforeMake = user.items.has(wmake.id) ? user.items.get(wmake.id) : 0;

				if(before === count * wmake.prices[1]) user.items.delete(current.id)
					else user.items.set(current.id, before - count * wmake.prices[1]);
				if(beforeMake) user.items.set(wmake.id, beforeMake + count)
					else user.items.set(wmake.id, count)

				emb.setTimestamp().setFooter({text: `ID: ${wmake.id}`})
				.setDescription(`Сделано **\`x${count}\`** ${wmake.emoji} **\`${wmake.name}\`**\n${current.emoji}** \`${current.name}\`**: **\`${`x${before}`.padStart(4, ' ')}\`** => **\`${`x${before === count * wmake.prices[1] ? 0 : user.items.get(current.id)}`.padStart(4, ' ')}\`**\n${wmake.emoji} **\`${wmake.name}\`**: **\`${`x${beforeMake}`.padStart(4, ' ')}\`** => **\`${`x${user.items.get(wmake.id)}`.padStart(4, ' ')}\`**`);
				await user.save();
				const d = new Discord.ActionRowBuilder({
					components: [new Discord.ButtonBuilder({customId: before === count * wmake.prices[1] ? `back-${id}` : `item_back-${id}`, label: 'Вернуться', style: 2})]
				});
				await i.update({embeds: [emb], components: [d]})
			},
			async item_remove(i) {
				const count = +i.message.components[0].components[0].options.find(x => x.default).value.split('_')[1];
				const before = user.items.get(current.id); 

				if(count > 10) user.items.delete(current.id)
					else user.items.set(current.id, before - count);

				emb.setTimestamp().setFooter({text: `ID: ${current.id}`})
				.setAuthor({name: `${i.user.username} | Удаление`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})})
				.setDescription(`Удалено **\`x${count}\`** ${current.emoji} **\`${current.name}\`**\n**\`${`x${before}`.padStart(4, ' ')}\`** => **\`${`x${before === count ? 0 : user.items.get(current.id)}`.padStart(4, ' ')}\`**`);
				
				await user.save();
				await i.update({embeds: [emb], components: [before === count * wmake.prices[1] ? back : backitem]})
			},
			async item_use(i) {
				const count = +i.message.components[0].components[0].options.find(x => x.default).value.split('_')[1];
				const before = user.items.get(current.id);
				const wuse = bot.game.resolve(current.usage[0]);
				const wuseCount = wuse.id === 'money' ? user.money : user.items.get(wuse.id);

				if(count > 10) user.items.delete(current.id)
					else user.items.set(current.id, before - count);

				if(current.usage[0] === 'money') user.money += count * current.usage[1];
				else user.items.has(wuse.id) ?
					user.items.set(wuse.id, user.items.get(wuse.id) + count * current.usage[1]) :
					user.items.set(wuse.id, count * current.usage[1]);

				emb.setTimestamp().setFooter({text: `ID: ${current.id}`})
				.setAuthor({name: `${i.user.username} | Использование`, iconURL: i.user.avatarURL({format: 'png', dynamic: true})})
				.setDescription(`Использовано **\`x${count}\`** ${current.emoji} **\`${current.name}\`**\n${current.emoji} **\`${current.name}\`** **\`x${before}\`** => **\`x${before === count ? 0 : user.items.get(current.id)}\`**\n${wuse.emoji} **\`${wuse.name}\`** **\`${wuseCount}\`** => **\`${wuseCount + count * current.usage[1]}\`**`);
				
				await user.save();
				await i.update({embeds: [emb], components: [before === count * wmake.prices[1] ? back : backitem]})
			},
			async item_back(i) {
				await actions.inventory_select(i, false);
			}
		};
		collector.on('collect', async i => {
			if(interaction.commandName === i.message.interaction.commandName && i.message.id === reply.id && i.user.id === interaction.user.id && (i.customId.endsWith(id) || i?.values?.[0]?.endsWith(id))) {
				i.customId = i.customId.replace(`-${id}`, '');
				if(i?.values?.[0]) i.values[0] = i.values[0].replace(`-${id}`, '');
				if(actions[i.customId]) await actions[i.customId](i).catch(console.error);
			}// else if(i.message.id !== reply.id) return true
			else i.reply({ephemeral: true, content: ':skull:'});
		})
		collector.on('end', async() => {
			bot.game.invcds.delete(interaction.user.id);
			await interaction.editReply({embeds: [emb], components: []});
		});
	}
}
