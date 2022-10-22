class Button {
	constructor(...c){
		this.type = 'ACTION_ROW';
		this.components = [];
		for(const comp of c){ this.components.push(Discord.Util.mergeDefault(util.consts.button, comp)) };
	}
}
class Menu {
	constructor(c){
		this.type = 'ACTION_ROW';
		this.components = [Discord.Util.mergerDefault(util.consts.menu, c)];
	}
}
module.exports = null//Button, Menu;