const db = require('../utils/mongo.js')
module.exports = class {
	constructor(){
		this.evt = 'messageCreate';
		this.cds = [new Set(), new Set()];
	}
	async run(message){
		if (message.author.bot || !message.guild) return;
		let user = await db.user.findOne({id: message.author.id});
		const guild = await db.guild.findOne({id: message.guild.id});
		if(!guild) return;
        if(!user){
            user = await db.user.create({id: message.author.id}); //message.say(`ух какой!!!! спасибо за то, что пользуетесь нашим ботом! или моим... похуй. продолжайте общаться на различные темы и получать бонуусы в виде мег-супер-дупер дорогой валюты и попыта ой блять что я написал ХАХХАХЪХАХАХХАХХАХАХАХ`)
        }
        let st = false;
        if(guild.statuses[0]){
    	if(!this.cds[0].has(user.user)){
    		st = true;
			user.xp += 1;
			this.cds[0].add(user.user);
        	setTimeout(() => {
            	this.cds[0].delete(user.user);
        	}, 30000);
        const toLvl = user.level**2 * (user.level + user.level) + 150 * user.level;
	    if(user.xp >= toLvl){
	        user.level += 1;
	        message.say(`> **${message.author.username}** достиг **${user.level}** уровня!`).then(x => x.delete(5000));
	    }
    	}
    }
	    if(guild.statuses[1]){
		if(!this.cds[1].has(user.user)){
			st = true;
			user.money += 1;
			this.cds[1].add(user.user);
	        setTimeout(() => {
	            this.cds[1].delete(user.user);
	        }, 60000);
	    }
	}
		if(st) await user.save();
	}
}
