const colors = require('colors/safe');
module.exports = class {
    constructor(client) {
        this.bot = client;
        this.evt = 'ready';
    }
    async run() {
       const reminds = await this.bot.db.remind.find();
       const now = Date.now();
       this.bot.reminds = new Discord.Collection();
       reminds[0] ? console.log(colors.bold.red('[ProjectD]'), `Загружено ${reminds.length} напоминаний.`) : 0;
       for(const r of reminds){
        const [c, id] = r.sendTo.split('-');
        const channel = c === 'channel' ? this.bot.client.channels.cache.get(id) : this.bot.client.users.cache.get(id);
        const user = channel?.tag ? channel : this.bot.client.users.cache.get(r.user);
            this.bot.reminds.set(r.id, setTimeout(async() => {
                await channel.send({
                    content: `<@${r.user}>`,
                    embeds: [new this.bot.Embed({color: 16777215, author: {name: 'Напоминание', iconURL: user.avatarURL({format: 'png', dynamic: true})}, description: `\`\`\`${r.text}\`\`\``}).setTimestamp()]
                });
                this.bot.reminds.delete(r.id)
                await this.bot.db.remind.deleteOne({id: r.id});
            }, r.date - now)
        )
       }
    }
};
