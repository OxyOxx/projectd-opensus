const mongoose = require('mongoose')
const user = mongoose.Schema({
	id: String,
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    money: { type: Number, default: 20 },
    about: { type: String, default: 'Я очень загадочный человек...' },
    items: { type: Map, of: Number, default: new Map()}
});
const guild = mongoose.Schema({
	id: String,
	profileType: {type: String, default: 'embed'},
	ecoWallet: {type: String, default: '¥'},
	prefix: {type: String, default: require('../config.js').prefix},
	channels: {type: Array, default: [[], []]},
	statuses: {type: Array, default: [true, true]}
})
const wallet = mongoose.Schema({
	id: String,
	adress: String,
	balance: {type: Number, default: 0}
})
const blockchain = mongoose.Schema({
	index: Number,
	hash: String,
	prevHash: String,
	timestamp: Number,
	data: {
		amount: Number,
		from: String,
		to: String
	}
})
const price = mongoose.Schema({
	balance: {type: Number, default: 10000000},
	tokens: {type: Number, default: 5000}
})
const remind = mongoose.Schema({
	id: String,
	user: String,
    text: String,
    sendTo: String,
    date: Number
});
module.exports = {
	user: mongoose.model('user', user),
	guild: mongoose.model('guild', guild),
	wallet: mongoose.model('wallet', wallet),
	blockchain: mongoose.model('blockchain', blockchain),
	price: mongoose.model('price', price),
	remind: mongoose.model('remind', remind)
}
