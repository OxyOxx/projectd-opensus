const Blocks = require('../classes/Blocks');

module.exports = {
	data: {
		name: 'wallet',
		description_localizations: {
			'en-US': 'Fully centralized wallet!',
			//'ru': 'Полностью централизованный кошелёк!',
			'uk': 'Повністю централізованний гаманець!'
		},
		description: 'Полностью централизованный кошелёк!',
		options: [
			{
		      type: 1,
		      name: 'view',
		      description_localizations: {
				'en-US': 'View wallet',
				//'ru': 'Посмотреть кошелёк',
				'uk': 'подивитися гаманець'
			  },
		      description: 'Посмотреть кошелёк',
		      options: [
		        {
		          type: 3,
		          name: 'адрес',
		          name_localizations: {
				  	'en-US': 'adress',
					//'ru': 'адрес',
					'uk': 'адрес'
			  	  },
		          description_localizations: {
				  	'en-US': 'Adress',
					//'ru': 'Адрес',
					'uk': 'Адрес'
			  	  },
		          description: 'Адрес'
		        }
		      ]
		    },
		    {
		      type: 1,
		      name: 'send',
		      description: 'Отправить DEL\'ы',
		      options: [
		        {
		          type: 3,
		          name: 'адрес',
		          description: 'Адрес для отправки',
		          required: true
		        },
		        {
		          type: 10,
		          name: 'кол-во',
		          description: 'Количество DEL\'ов',
		          required: true
		        }
		      ]
		    },
		    {
		    	type: 2,
		    	name: 'market',
		    	description: 'Магазин',
		    	options: [
		    		{
		    			type: 1,
		    			name: 'view',
		    			description: 'Посмотреть магазин'
		    		},
		    		{
		    			type: 1,
		    			name: 'buy',
		    			description: 'Купить DEL\'ы',
		    			options: [
		    				{
		        				type: 10,
		        				name: 'кол-во',
		        				description: 'Количество DEL\'ов',
		        				required: true
		        			}
		    			]
		    		},
		    		{
		    			type: 1,
		    			name: 'sell',
		    			description: 'Продать DEL\'ы',
		    			options: [
		    				{
		        				type: 10,
		        				name: 'кол-во',
		        				description: 'Количество DEL\'ов',
		        				required: true
		        			}
		    			]
		    		}
		    	]
		    }
		]
	},
	async run(bot, interaction){
		try {
		const emb = new bot.Embed({color: 16777215, author: {name: 'Кошелёк', iconURL: 'https://images.emojiterra.com/google/android-pie/512px/1f4b3.png'}}).setTimestamp();
		await interaction.reply({content: util.consts.replies[~~(Math.random() * util.consts.replies.length)]});
		if(interaction.options._subcommand === 'view' && !interaction.options._group){

			let userwallet = await bot.db.wallet.findOne({id: interaction.user.id});
			if(!userwallet) {
				const adress = Blocks.generateHash(~~(Math.random() * 10000), ~~(Math.random() * 10000), new Date());
				let balance = await bot.db.blockchain.find({'data.to': adress});

				balance = balance[0] ? balance.reduce((a, b) => a + b.data.amount, 0) : 0;
				userwallet = await bot.db.wallet.create({id: interaction.user.id, adress, balance});
			}

			const adress = interaction.options.getString('адрес');

			if(adress && adress.length !== 64) return interaction.editReply({embeds: [emb.setDescription('Длинна адреса должна равняться **`64`** символам.')]})
			const prices = await bot.db.price.findOne();
			const wallet = await bot.db.wallet.findOne({adress}) || userwallet;
			const is = adress && adress !== wallet.adress;
			const transactions = [...(await bot.db.blockchain.find({'data.from': is ? adress : wallet.adress}))
			, ...(await bot.db.blockchain.find({'data.to': is ? adress : wallet.adress}))]
			.sort((a, b) => a.index > b.index);

			if(is) {
				wallet.id = null
				wallet.adress = adress;
				wallet.balance = transactions[0] ? transactions.reduce((a,b) => a + b.data.amount, 0):0;
			}
			const transText = transactions.map(x => `**\`${x.data.amount}\`** - [${x.data.from === wallet.adress ? 'Этот' : (x.data.from === 'projectd' ? 'Система' : x.data.from.slice(0, 10)+'...')}](https://google.com "${x.data.from === 'projectd' ? 'ProjectD' : x.data.from}") => [${x.data.to === 'projectd' ? 'Система': (x.data.to === wallet.adress ? 'Этот' : x.data.to.slice(0, 10)+'...')}](https://google.com "${x.data.to}")`);
			emb.setFooter({text: wallet.balance ? `${~~(wallet.balance * (prices.balance / prices.tokens))} ¥` : `0 ¥`}).setDescription(`🏷️ **Адрес**: **\`${wallet.adress}\`**\n<:del:960830471581892638> **Баланс**: **\`${wallet.balance}\`**\n**🧾 Транзакции** [**\`${transactions.length}\`**]:\n${transText.join('\n')||'Нету'}`)

			return interaction.editReply({content: null, embeds: [emb], ephemeral: true})
		} else if(interaction.options._subcommand === 'send'){
			let pressed = false;
			const adress = interaction.options.getString('адрес');
			const amount = interaction.options.getNumber('кол-во');
			let wallet = await bot.db.wallet.findOne({id: interaction.user.id});

			if(!wallet) {
				const adr = Blocks.generateHash(~~(Math.random() * 10000), ~~(Math.random() * 10000), new Date());
				let balance = await bot.db.blockchain.find({'data.to': adr});

				balance = balance[0] ? balance.reduce((a, b) => a + b.data.amount, 0) : 0;
				wallet = await bot.db.wallet.create({id: interaction.user.id, adress: adr, balance});
			}

			if(wallet.adress === adress) return interaction.editReply({content: null, embeds: [emb.setDescription('Это же **ваш** адрес кошелька...')]});
			const walletTo = await bot.db.wallet.findOne({adress});

			if(adress.length !== 64) return interaction.editReply({content: null, embeds: [emb.setDescription('Длинна адреса должна равняться **`64`** символам.')]})
			if(amount < 0.0001) return interaction.editReply({content: null, embeds: [emb.setDescription('Минимальное колличество DEL\'ов для отправки - **`0.0001`**')]});
			if(wallet.balance < amount) return interaction.editReply({content: null, embeds: [emb.setDescription('Недостаточно DEL\'ов на вашем балансе для отправки.')]});
			
			const filter = i => ['accept', 'decline'].includes(i.customId) && i.user.id === interaction.user.id || i.deferUpdate();
			
			const buttons = new Discord.ActionRowBuilder({
				components: [new Discord.ButtonBuilder({customId: 'decline', label: 'Отменить', style: 'DANGER'}),
							new Discord.ButtonBuilder({customId: 'accept', label: 'Отправить', style: 'SUCCESS'})]
			})
			await interaction.editReply({components: [buttons], content: null, embeds: [emb.setTitle('Отправка DEL\'ов').setDescription(`**Баланс**: **\`${wallet.balance}\`**\n**Количество**: **\`${amount}\`**\n**Баланс после**: **\`${wallet.balance-amount}\`**\n**Ваш адрес**:\n**\`${wallet.adress}\`**\n**Адрес получателя**:\n **\`${adress}\`**\n\n**Вы уверены, что хотите отправить DEL'ы на введённый кошелёк? Действие необратимо и при ошибке вам никто не поможет.**`)]})
			const collector = interaction.channel.createMessageComponentCollector({filter, timeout: 90000});
			collector.on('collect', async i => {
				await ({
					async accept(){
						pressed = true;
						await interaction.editReply({components: [], embeds: [emb.setDescription('Обработка транзакции...')]});
						await sleep(3000);
						wallet.balance -= amount;
						if(walletTo) walletTo.balance += amount;
						const data = {
							timestamp: new Date(),
							data: {
								amount,
								from: wallet.adress,
								to: adress
							}
						};
						if(walletTo) await walletTo.save();
						await wallet.save();
						const block = await Blocks.generateNext(data);
						await bot.db.blockchain.create(block);
						emb.setDescription(`Транзакция принята!\n**Кол-во DEL'ов**: **\`${amount}\`**\n**Hash блока**:\n**\`${block.hash}\`**`)
						await interaction.editReply({embeds: [emb]});
						collector.stop();
					},
					async decline(){
						pressed = true;
						emb.setDescription(`Транзакция отменена.`);
						await interaction.editReply({components: [], embeds: [emb]});
						collector.stop();
					}
				})[i.customId]();
			});
			collector.on('end', () => {
				if(!pressed) interaction.editReply({components: [], embeds: [emb.setDescription('Время на ответ вышло, транзакция отменена.')]})
			})
		 } else if(interaction.options._group === 'market' && interaction.options._subcommand === 'view'){

		 	const prices = await bot.db.price.findOne();
			const delPrice = prices.balance / prices.tokens;
			emb.setAuthor({name: 'Магазин', iconURL: 'https://images.emojiterra.com/twitter/512px/1f3ea.png'})
			.setDescription(`**Капитализация**: **\`${prices.balance}\`** ¥\n**Оставшиеся DEL'ы**: **\`${prices.tokens}\`**\n**Курс** **\`1\`** <:del:960830471581892638> к **\`${~~delPrice}\`** ¥`)

		 	return interaction.editReply({content: null, embeds: [emb]})
		 } else if(interaction.options._subcommand === 'buy'){
			let wallet = await bot.db.wallet.findOne({id: interaction.user.id});
			const user = await bot.db.user.findOne({id: interaction.user.id});
			const amount = interaction.options.getNumber('кол-во');
			if(!wallet) {
				const adr = Blocks.generateHash(~~(Math.random() * 10000), ~~(Math.random() * 10000), new Date());
				let balance = await bot.db.blockchain.find({'data.to': adr});

				balance = balance[0] ? balance.reduce((a, b) => a + b.data.amount, 0) : 0;
				wallet = await bot.db.wallet.create({id: interaction.user.id, adress: adr, balance});
			}

			if(amount < 0.0001) return interaction.editReply({content: null, embeds: [emb.setDescription('Минимальное колличество DEL\'ов для покупки - **`0.0001`**')]});

			const prices = await bot.db.price.findOne();
			const delPrice = prices.balance / prices.tokens;

			
			const filter = i => ['accept', 'decline'].includes(i.customId) && i.user.id === interaction.user.id || i.deferUpdate();
			
			const buttons = new Discord.ActionRowBuilder({
				components: [new Discord.ButtonBuilder({customId: 'decline', label: 'Отменить', style: 'DANGER'}),
							new Discord.ButtonBuilder({customId: 'accept', label: 'Купить', style: 'SUCCESS'})]
			})
			await interaction.editReply({components: [buttons], content: null, embeds: [emb.setFooter({text: `Баланс: ${user.money} ¥`}).setTitle('Покупка DEL\'ов').setDescription(`**Курс** **\`1\`** <:del:960830471581892638> к **\`${~~delPrice}\`** ¥\n\nЦена за **\`${amount}\`** <:del:960830471581892638>: **\`${~~(delPrice*amount)}\`** ¥\nВы точно хотите купить столько DEL'ов?`)]})
			const collector = interaction.channel.createMessageComponentCollector({filter, timeout: 90000});
			collector.on('collect', async i => {
				await ({
					async accept(){
						pressed = true;
						
						await interaction.editReply({components: [], embeds: [emb.setDescription('Обработка транзакции...')]});
						
						if(user.money < ~~(amount*delPrice)) return await interaction.editReply({components: [], embeds: [emb.setDescription('Недостаточно средств для покупки.')]});
						await sleep(3000);
						user.money -= ~~(amount*delPrice);
						wallet.balance += amount;
						prices.balance += ~~(amount*delPrice);
						prices.tokens -= amount;
						
						const data = {
							timestamp: new Date(),
							data: {
								amount,
								from: 'projectd',
								to: wallet.adress
							}
						};
						
						const block = await Blocks.generateNext(data);

						await wallet.save();
						await user.save();
						await prices.save();
						await bot.db.blockchain.create(block);
						
						emb.setFooter({text: `Баланс: ${user.money} ¥`}).setDescription(`Транзакция принята!\n**Кол-во DEL'ов**: **\`${amount}\`**\n**Hash блока**:\n**\`${block.hash}\`**`)
						
						await interaction.editReply({embeds: [emb]});
						collector.stop();
					},
					async decline(){
						pressed = true;
						await interaction.editReply({components: [], embeds: [emb.setDescription(`Покупка отменена.`)]});
						collector.stop();
					} 
				})[i.customId]();
			});
			collector.on('end', () => {
				if(!pressed) interaction.editReply({components: [], embeds: [emb.setDescription('Время на ответ вышло, транзакция отменена.')]})
			})
		} else if(interaction.options._subcommand === 'sell'){
			let wallet = await bot.db.wallet.findOne({id: interaction.user.id});
			const user = await bot.db.user.findOne({id: interaction.user.id});
			const amount = interaction.options.getNumber('кол-во');
			if(!wallet) {
				const adr = Blocks.generateHash(~~(Math.random() * 10000), ~~(Math.random() * 10000), new Date());
				let balance = await bot.db.blockchain.find({'data.to': adr});

				balance = balance[0] ? balance.reduce((a, b) => a + b.data.amount, 0) : 0;
				wallet = await bot.db.wallet.create({id: interaction.user.id, adress: adr, balance});
			}

			if(amount < 0.0001) return interaction.editReply({content: null, embeds: [emb.setDescription('Минимальное количество DEL\'ов для продажи - **`0.0001`**')]});

			const prices = await bot.db.price.findOne();
			const delPrice = prices.balance / prices.tokens;

			
			const filter = async i => ['accept', 'decline'].includes(i.customId) && i.user.id === interaction.user.id ? true : await i.deferUpdate();
			
			const buttons = new Discord.ActionRowBuilder({
				components: [new Discord.ButtonBuilder({customId: 'decline', label: 'Отменить', style: 'DANGER'}),
							new Discord.ButtonBuilder({customId: 'accept', label: 'Купить', style: 'SUCCESS'})]
			})
			await interaction.editReply({components: [buttons], content: null, embeds: [emb.setFooter({text: `DEL'ов: ${wallet.balance}`}).setTitle('Продажа DEL\'ов').setDescription(`**Курс** **\`1\`** <:del:960830471581892638> к **\`${~~delPrice}\`** ¥\n\nЦена за **\`${amount}\`** <:del:960830471581892638>: **\`${~~(delPrice*amount)}\`** ¥\nВы точно хотите продать столько DEL'ов?`)]})
			const collector = interaction.channel.createMessageComponentCollector({filter, timeout: 90000});
			collector.on('collect', async i => {
				await ({
					async accept(){
						pressed = true;
						
						await interaction.editReply({components: [], embeds: [emb.setDescription('Обработка транзакции...')]});
						
						if(wallet.balance < amount) return await interaction.editReply({components: [], embeds: [emb.setDescription('Недостаточно средств для покупки.')]});
						await sleep(3000);
						user.money += ~~(amount*delPrice);
						wallet.balance -= amount;
						prices.balance -= ~~(amount*delPrice);
						prices.tokens += amount;
						
						const data = {
							timestamp: new Date(),
							data: {
								amount,
								from: wallet.adress,
								to: 'projectd'
							}
						};
						
						const block = await Blocks.generateNext(data);

						await wallet.save();
						await user.save();
						await prices.save();
						await bot.db.blockchain.create(block);
						
						emb.setFooter({text: `DEL'ов: ${wallet.balance}`}).setDescription(`Транзакция принята!\n**Кол-во DEL'ов**: **\`${amount}\`**\n**Hash блока**:\n**\`${block.hash}\`**`)
						
						await interaction.editReply({embeds: [emb]});
						collector.stop();
					},
					async decline(){
						pressed = true;
						await interaction.editReply({components: [], embeds: [emb.setDescription(`Покупка отменена.`)]});
						collector.stop();
					}
				})[i.customId]()
			})
			collector.on('end', () => {
				if(!pressed) interaction.editReply({components: [], embeds: [emb.setDescription('Время на ответ вышло, транзакция отменена.')]})
			})
		}
	} catch (e){console.log(e)}
	}
}
