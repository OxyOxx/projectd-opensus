module.exports = {
	data: {
		name: 'random',
		description: 'Всякие рандомные штучки',
		options: [
			{
				type: 1,
		      	name: 'number',
		      	description: 'Случайное число',
		      	options: [
		        	{
		        		type: 10,
		          		name: 'до',
		          		description: 'Максимальное число',
		          		required: true
		        	},
		        	{
		        		type: 10,
		          		name: 'от',
		          		description: 'Минимальное число'
		        	}
		      	]
			},
			{
				type: 1,
		      	name: 'dice',
		      	description: 'Бросить кубик',
		      	options: [
		        	{
		        		type: 10,
		          		name: 'грани',
		          		description: 'Число граней'
		        	},
		        	{
		        		type: 10,
		          		name: 'броски',
		          		description: 'Кол-во бросков'
		        	}
		      	]
			}
		]
	},
	async run(bot, interaction){
		if(interaction.options._subcommand === 'number'){
			const min = ~~interaction.options.getNumber('от')||0, max = ~~interaction.options.getNumber('до')||10;
			const rand = ~~(Math.random() * max) + min;
			const e = new bot.Embed({color: 16777215,
			 description: min === max ? `🔢 Ну тут без вариантов **\`${min}\`**!` : `🔢 Случайное число: **\`${min}\`**`,
			});
			return interaction.reply({embeds: [e]});
		} else {
			let sides = ~~interaction.options.getNumber('грани')||6, tries = ~~interaction.options.getNumber('броски')||1;
			if(sides < 1) sides = 6
				else if(sides > 120) sides = 120;
			if(tries < 1) tries = 1
				else if(tries > 50) tries = 50;
			const dc = Array.from({length: tries}, () => ~~(Math.random() * sides))
			const e = new bot.Embed({color: 16777215,
			 description: `🎲 Бросок кости [**\`${tries}\`**/**\`${sides}\`**]:${tries > 1 ? `\n\`\`\`${dc.join(', ')}\`\`\`` : ` **\`${dc[0]}\`**`}`,
			});
			return interaction.reply({embeds: [e]});
		}
	}
}
