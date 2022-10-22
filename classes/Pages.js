class Pages {
	constructor(user, options = {}){
		this.user = user??null;
		this.time = options.time??60000;
		this.pages = options.pages??[];
		this.emojis = options.emojis??['◀️', '⏹️', '▶️'];
	}
	add(page){
		if(!page) return undefined;
		this.pages.push(page);
		return this
	}
	del(page){
		if(!page) return undefined;
		this.pages = this.pages.remove(page);
		return this;
	}
	async send(message){
		if(!message) throw new Error('Message is not provided');
		if(this.user === null) throw new Error('Invalid user');
		if(!this.pages[0]) throw new Error('Pages length equals to 0');
		let id = '', cur = 0;
		const chr = 'abcdefghijklmnopqrstuvwxyz0123456789';
		for(let i = 0; i < 6; i++) id += chr[~~(Math.random() * chr.length)];
		const row = new Discord.ActionRowBuilder({
						components: [new Discord.ButtonBuilder({customId: `prev-${id}`, label: '<', style: 1, disabled: cur === 0}),
							new Discord.ButtonBuilder({customId: `stop-${id}`, label: '◻', style: 1}),
							new Discord.ButtonBuilder({customId: `next-${id}`, label: '>', style: 1, disabled: this.pages.length === 1})]
					});


		const msg = await message.say({embeds: [this.pages[0]], components: [row]});
		const filter = (i) => {
			return i.user.id === this.user.id && i.customId.includes(`-${id}`);
		}
		const collector = message.channel.createMessageComponentCollector({filter, idle: 60000});
		
		collector.on('collect', async i => {
			if(i.customId.includes('prev')){
				if(cur === 1) row.components[0].data.disabled = true;
				if(cur === this.pages.length-1) row.components[2].data.disabled = false;
				cur--;
				return await i.update({embeds: [this.pages[cur]], components: [row]})
			} else if(i.customId.includes('next')){
				if(!cur) row.components[0].data.disabled = false;
				if(cur === this.pages.length-2) row.components[2].data.disabled = true;
				cur++;
				return await i.update({embeds: [this.pages[cur]], components: [row]})
			} else if(i.customId.includes('stop')){
				collector.stop()
			}
			
		})
		// if(r.emoji.name === this.emojis[0]){
			// 	if(cur === 0) return;
			// 	else {
			// 		cur -= 1
			// 		message.edit(this.pages[cur])
			// 	}
			// } else if(r.emoji.name === this.emojis[2]){
			// 	if(cur+1 === this.pages.length) return;
			// 	else {
			// 		cur += 1
			// 		message.edit(this.pages[cur])
			// 	}
			// } else if(r.emoji.name === this.emojis[1]){
			// 	collector.stop()
			// }

		// collector.on('remove', (r, user) => {
		// 	if(r.emoji.name === this.emojis[0]){
		// 		if(cur === 0) return
		// 		else {
		// 			cur -= 1
		// 			message.edit(this.pages[cur])
		// 		}
		// 	} else if(r.emoji.name === this.emojis[2]){
		// 		if(cur+1 === this.pages.length) return;
		// 		else {
		// 			cur += 1
		// 			message.edit(this.pages[cur])
		// 		}
		// 	} else if(r.emoji.name === this.emojis[1]){
		// 		collector.stop()
		// 	}
		// })
		collector.on('end', () => {
			msg.edit({components: []})
		})
		return true;
	}
}
module.exports = Pages
