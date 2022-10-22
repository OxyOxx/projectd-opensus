const ItemData = require('./ItemData.js');
class Item extends ItemData {
	constructor(params){
		super(params);
		if(params.recipes) this.recipes = params.recipes;
		if(params.prices) this.prices = params.prices;
		if(params.usage) this.usage = params.usage;
		if(params.specs) this.specs = params.specs;
	}
}
module.exports = {
	'money': new Item({
		id: 'money',
		name: 'Монеты',
		description: 'Ну, валюта бота?',
		flags: 1, emoji: '<:zl:960946800196481124>'
	}),
	'del': new Item({
		id: 'del',
		name: 'DEL',
		description: 'Ничего ценнее DEL\'a в этом мире нет... разве что яблоки.',
		flags: 4, emoji: '<:del:960830471581892638>'
	}),
	'apple': new Item({
		id: 'apple',
		name: 'Яблоко',
		description: 'Сочное, хрустящее и сладкое. Наверное, оно понравится почти всем.',
		flags: 196, emoji: '🍎', prices: [10]
	}),
	'uncommon_box_shard': new Item({
		id: 'uncommon_box_shard',
		name: 'Часть необычного ящика',
		description: 'Составляющая необычного ящика.',
		recipes: ['uncommon_box'],
		flags: 108, emoji: '<:uncommon_box_shard:960638821572182026>', prices: [30]
	}),
	'rare_box_shard': new Item({
		id: 'rare_box_shard',
		name: 'Часть редкого ящика',
		description: 'Составляющая редкого ящика.',
		recipes: ['rare_box'],
		flags: 108, emoji: '<:rare_box_shard:960638821718962256>', prices: [60]
	}),
	'mythic_box_shard': new Item({
		id: 'mythic_box_shard',
		name: 'Часть мифического ящика',
		description: 'Составляющая мифического ящика.',
		recipes: ['mythic_box'],
		flags: 108, emoji: '<:mythic_box_shard:960638821660246026>', prices: [70]
	}),
	'legendary_box_shard': new Item({
		id: 'legendary_box_shard',
		name: 'Часть легендарного ящика',
		description: 'Составляющая легендарного ящика.',
		recipes: ['legendary_box'],
		flags: 108, emoji: '<:legendary_box_shard:960638821706383460>', prices: [90]
	}),
	'small_money_bag': new Item({
		id: 'small_money_bag',
		name: 'Маленький мешочек денег',
		description: 'Разве что-то есть лучше денег? Естественно яблоки!',
		usage: ['money', 20],
		flags: 20, emoji: '<:small_money_bag:973841430642569258>'
	}),
	'medium_money_bag': new Item({
		id: 'medium_money_bag',
		name: 'Средний мешочек денег',
		description: 'Достаточно солидная сума, разве нет?',
		usage: ['money', 50],
		flags: 20, emoji: '<:medium_money_bag:973841478801588234>'
	}),
	'big_money_bag': new Item({
		id: 'big_money_bag',
		name: 'Большой мешочек денег',
		description: 'Хм... целых 100 монет...',
		usage: ['money', 100],
		flags: 20, emoji: '<:big_money_bag:973841536599081000>'
	}),
	'fishing_rod_basic': new Item({
		id: 'fishing_rod_basic',
		name: 'Бамбуковая удочка',
		description: 'На удивление невероятно прочная!',
		specs: ['fish_multiply', 1],
		flags: 324, prices: [500]
	}),
	'fishing_rod_advanced': new Item({
		id: 'fishing_rod_advanced',
		name: 'Маховая удочка',
		description: 'Made in China?',
		specs: ['fish_multiply', 1.2],
		flags: 324, prices: [1500]
	}),
	'fishing_rod_pro': new Item({
		id: 'fishing_rod_pro',
		name: 'Спиннинг',
		description: 'Вытянет даже слона',
		usage: ['money', 100],
		specs: ['fish_multiply', 1.8],
		flags: 324, prices: [3000]
	})
}
