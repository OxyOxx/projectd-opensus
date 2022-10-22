const fishes = [
	['karas_fish', 'Карасик', .9],
	['salmon_fish', 'Лосось', .6],
	['koi_fish', 'Кои', .3],
	['gold_fish', 'Золотая рыбка', .1]
]
module.exports = {
	config: {
		name: 'fish',
		description: 'Максимально честная рыбалка',
		category: 'eco',
		aliases: ['fh'],
		cooldown: 1
	},
	async run(bot, message, args) {
		const rew = {};
		for(let i = +args[0]||1; i > 0; i--) {
			const r = fishes.filter(x => x[2] < +Math.random().toFixed(4))[0];
			if(r) rew[r[0]] ? rew[r[0]] += 1 : rew[r[0]] = 1;
		}
		const keys = Object.keys(rew);
		message.say(keys.map(x => `${x} - ${rew[x]}`).join('\n'))
	}
}
