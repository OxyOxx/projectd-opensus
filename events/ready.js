module.exports = class {
    constructor(client) {
        this.bot = client;
        this.evt = 'ready';
    }
    run() {
        this.bot.client.user.setPresence({
            activities:{
              type: 3,
              name: this.bot.client.user.tag  
            },
        	status: 'idle'
        });
        const colors = require('colors/safe');
        console.log(colors.bold.red(`[ProjectD]`), `Бот запущен под ${this.bot.client.user.tag}(${this.bot.client.user.id})`)
    }
};
