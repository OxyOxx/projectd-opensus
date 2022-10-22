const Item = require('./ItemData.js');
class Box extends Item {
	constructor(params){
		super(params);
		this.items = params.items;
		if(params.prices) this.prices = params.prices;
	}
	get displayItems(){
		return this.items.map(x => `${x[0]} - ${x[1]}% (${x[3]||0}-${x[2]})`);
	}
	open(count, mlt = 1){
		const rewards = {money: 0};

		for(let c = count; c > 0; c-=1){
			const items = this.items.filter(x => x[1]*mlt > Math.random()*100);
			for(const x of items){
				x[0] === 'money' ? rewards['money'] += ~~(Math.random() * (x[3] - x[2] + 1)) + x[2]
				: (rewards[x[0]] ? rewards[x[0]] += Math.ceil(x[2]*(Math.random())) : rewards[x[0]] = Math.ceil(x[2]*(Math.random())));
			}
		};
		return rewards;
	}
}
module.exports = {
	'common_box': new Box({
		id: 'common_box',
		name: 'Обычный ящик',
		description: 'Содержит монеты и осколки других ящиков.',
		items: [['money', 100, 10, 2],
				['uncommon_box_shard', 30, 2],
				['rare_box_shard', 5, 1]],
		prices: [45, 3],
		flags: 82, emoji: '<:common_box:960609842068860968>'
	}),
	'uncommon_box': new Box({
		id: 'uncommon_box',
		name: 'Необычный ящик',
		description: 'Содержит монеты, осколки других ящиков и другое.',
		items: [['money', 100, 15, 5],
				['rare_box_shard', 20, 2]],
		prices: [100, 4],
		flags: 90, emoji: '<:uncommon_box:960609842131763270>'
	}),
	'rare_box': new Box({
		id: 'rare_box',
		name: 'Редкий ящик',
		description: 'Содержит монеты и редкие предметы',
		items: [['money', 100, 30, 10],
				['rare_box_shard', 10, 2],
				['mythic_box_shard', 35, 2]],
		prices: [200, 5],
		flags: 90, emoji: '<:rare_box:960609842018549790>'
	}),
	'mythic_box': new Box({
		id: 'mythic_box',
		name: 'Мифический ящик',
		description: 'Нужно написать',
		items: [['money', 100, 50, 30],
				['uncommon_box_shard', 5, 4],
				['rare_box_shard', 10, 3],
				['legendary_box_shard', 35, 2]],
		prices: [300, 6],
		flags: 90, emoji: '<:mythic_box:960609841339064350>'
	}),
	'legendary_box': new Box({
		id: 'legendary_box',
		name: 'Легендарный ящик',
		description: 'О нём гласят великие легенды, мол он может выдать что-то ценное...',
		items: [['money', 100, 150, 50],
				['rare_box_shard', 15, 4],
				['mythic_box_shard', 20, 3],
				['legendary_box_shard', 35, 1],
				['apple', 1, 1]],
		prices: [525, 7],
		flags: 90, emoji: '<:legendary_box:960609840957358101>'
	}),
	'secret_box': new Box({
		id: 'secret_box',
		name: 'Секретный ящик',
		description: 'Как ты это откопал!?',
		items: [['money', 100, 500, 100]],
		flags: 19
	}),
	Box: Box
}
