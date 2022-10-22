Bits = require('./Bits');
class ItemData {
	constructor(params) {
		this.id = params.id;
		this.name = params.name||null;
		this.description = params.description||null;
		this.emoji = params.emoji||null;
		this.flags = new Bits(params.flags, util.consts.gameFlags);
	}
}
module.exports = ItemData;