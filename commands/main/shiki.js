module.exports = {
	config: {
		name: 'shiki',
		category: 'main',
		cooldown: 2,
		aliases: ['shk', 'shikimori'],
		description: 'Аниме и пользователи с Shikimori.',
		usage: '[название аниме/пользователь/персонаж/сейю] <-u/-chr/-seyu>'
	},
	run: async(bot, message, args) => {
		const emb = new bot.Embed()
		.setTimestamp()
		.setColor('#fffffe')
		.setAuthor({name: 'Shikimori', iconURL: 'https://shikimori.one/favicons/favicon-192x192.png', url: 'https://shikimori.one'});
		let desc = '';
		if(args.includes('-u')){
			args = args.remove('-u');
			const query = args.join(' ');
			try {
			const data = await bot.rest.shiki.api.users[query]
			.get({query: {is_nickname: 1}, headers: {'User-Agent': 'node-shikimori'}})
			const gen = {
				male: '♂️',
				female: '♀️'
			}
			const typesStat = {
				planned: 'Запланировано',
				watching: 'Смотрит',
				rewatching: 'Пересматривает',
				completed: 'Просмотрено',
				'on_hold': 'Отложено',
				dropped: 'Заброшено'
			}
			emb.setThumbnail(data?.image?.x160)
			.setFooter({text: 'Был онлайн'})
			.setTimestamp(new Date(data?.last_online_at))
			.setTitle(`${data?.sex !== undefined && data.sex !== ''? `${gen[data.sex]} ` : ''}${data.nickname}${data?.name !== undefined && data?.name !== null && data?.name !== '' ? ` (${data.name})` : ``}`)
			.setURL(data.url)
			.setDescription(`${data?.banned ? '__**ЗАБАНЕН**__\n' : ''}${data?.about !== undefined && data.about !== '' ? `${data.about}\n` : ''}`);
			if(data.stats.full_statuses.anime.filter(x => x.size !== 0).length !== 0) emb.addFields([{
				name: `Статистика:`,
				value: data.stats.full_statuses.anime.filter(x => x.size !== 0).map(x => `${typesStat[x.name]} - **\`${x.size}\`**`).join('\n'),
				inline: true
			}])
			if(data.stats.scores.anime.length !== 0) emb.addFields({name: `Оценки:`, value: data.stats.scores.anime.map(x => `**\`${x.name}\`** - ${x.value}`).join('\n'), inline: true})


			// const data2 = await bot.rest.shiki.api.v2.user_rates.get({query: {user_id: data.id, target_type: 'Anime', status: 'completed'}});
			// const page2 = new bot.Embed()
			// .setTimestamp()
			// .setColor('#fffffe')
			// .setAuthor('Shikimori', 'https://shikimori.one/favicons/android-icon-192x192.png');
			// await data2.slice(0, 5).map(async x => {
			// 	const temp = await bot.rest.shiki.api.animes[x.id].get()
			// 	desc += `✅[${temp.russian}](https://shikimori.one/animes/${temp.id} "${temp.name}")\n`
			// })
			//page2.setDescription(desc)
			//const pages = new (require('../../classes/Pages.js'))(message.author);
			// pages.add(emb)//.add(page2)
			// return pages.send(message.channel)
			return message.say({embeds: [emb]})
			} catch (error){
				console.log(error)
				return message.say({embeds: [emb.setDescription(`Произошла ошибка или же не найден пользователь с именем **\`${query}\`**`)]})
			}
		} else if(args.includes('-chr')){
			//return message.say('> На переделке, скоре будет... или же нет.')
			args = args.remove('-chr');
			let i = 1;
			const q = args.join(' ');
			const data = await bot.rest.shiki.api.characters.search.get({query: {search: q}})
			const pages = new (require('../../classes/Pages.js'))(message.author);
			data.map(async chr => {
				pages.add(new bot.Embed()
				.setColor('#fffffe')
				.setFooter({text: `ID: ${chr.id} | ${i++}/${data.length}`})
				.setTimestamp()
				.setAuthor({name: 'Shikimori', iconURL: 'https://shikimori.one/favicons/favicon-192x192.png', url: 'https://shikimori.one'})
				.setTitle(`${chr.name} / ${chr.russian}`)
				.setURL(`https://shikimori.one${chr.url}`)
				.setImage(`https://shikimori.one${chr.image.original}`));
			})
			return pages.send(message)
		} else return message.say({embeds: [emb.setDescription('Пока-что только пользователь и персонаж, да-да...')]})
	}
};
