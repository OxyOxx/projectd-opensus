const math = require('mathjs');
const mathjs = math.create(math.all);
mathjs.sEval = mathjs.evaluate;
mathjs.import({
	'import':     function () { throw new Error('Function import is disabled') },
  	'createUnit': function () { throw new Error('Function createUnit is disabled') },
  	'evaluate':   function () { throw new Error('Function evaluate is disabled') },
  	'parse':      function () { throw new Error('Function parse is disabled') },
  	'simplify':   function () { throw new Error('Function simplify is disabled') },
  	'derivative': function () { throw new Error('Function derivative is disabled') },
  	'range':      function () { throw new Error('Function range is disabled') }
}, { override: true });
module.exports = {
	config: {
		name: 'math',
		category: 'main',
		cooldown: 2,
		aliases: ['calc', 'mth'],
		description: 'Решить указаный пример.',
		usage: '[при^мер]'
	},
	run: async(bot, message, args) => {
		const emb = new bot.Embed()
		.setColor('#fffffe')
		.setTimestamp();
		if(!args[0]) return message.say({embeds: [emb.setDescription('Хорошо, 2 + 2 = 5!')]});
		try {
			//if(/\d:infinity/g.test(args.join('').toLowerCase()) || /range\(\d,infinity\)/g.test(args.join('').toLowerCase())) return message.say(emb.setDescription('Разве бесконечность - предел?'));
			const x = mathjs.sEval(args.join(' '));
			if(typeof x === 'function') return message.say({embeds: [emb.setDescription('А зачем тебе функция?')]});
			return message.say({embeds: [emb.setDescription(`**\`${args.join(' ')}\`** = **\`${x.toString().length > 1024 ? x.toString().slice(0, 1025) + '...' : x}\`**`)]})
		} catch (err) {
			//\n[Ошибка?](${message.url} "${err}"
			return message.say({embeds: [emb.setDescription(`Что-то пошло не по плану...`).setFooter(`${err}`)]})
		}
	}
};