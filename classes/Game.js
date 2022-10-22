class Game {
	#invcds
	constructor(){
		this.items = require('./Items');
		this.boxes = require('./Boxes');
		this.#invcds = new Map();
	}
	resolve(id){
		if(!id.includes(':')) return this.items[id]||this.boxes[id]||null
		const splited = id.split(':'); 
		return this.items[splited[1]]||this.boxes[splited[1]]||null;
	}
	get invcds(){
		return this.#invcds;
	}
}
module.exports = Game;