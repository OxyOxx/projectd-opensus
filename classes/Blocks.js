const cryptojs = require('crypto-js');
const db = require('../utils/mongo.js');
class Blocks {
	static generateHash(index, hash, timestamp, amount = 0){
		return cryptojs.SHA256(index + hash + timestamp + amount).toString();
	}

	static async generateNext(block){
		const lastBlock = (await db.blockchain.find().sort({index: -1}))[0];
		block.index = lastBlock.index + 1;
		block.hash = this.generateHash(block.index, lastBlock.hash, block.timestamp, block.data.amount);
		block.prevHash = lastBlock.hash;

		return block;
	}
}
module.exports = Blocks;