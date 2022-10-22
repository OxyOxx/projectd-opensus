module.exports = class {
    constructor(bot) {
        this.bot = bot;
        this.evt = 'messageCreate'
    }
    async run(message) {
        if (message.channel.type == 1 || message.author.bot) return;// || !message.guild.me.permissions.has('SendMessages')
        if(!message.guild.data) message.guild.data = this.bot.client.guilds.cache.get(message.guild.id).data = await this.bot.db.guild.findOne({id: message.guild.id}) || await this.bot.db.guild.create({id: message.guild.id});
        if(message.mentions.users.find(x => x.id === this.bot.client.user.id) && message.channel.type !== 11) return message.say(`Если не ошибаюсь, мой префикс – **\`${message.guild.data.prefix}\`**`);
        if(!message.content.startsWith(this.bot.client.config.prefix)) return;
        const args = message.content.trim().split(/ +/g);
        const command = args.shift().slice(this.bot.client.config.prefix.length);
        const cmd = this.bot.client.commands.get(command) || this.bot.client.commands.find(x => x.config.aliases.includes(command));
        if (cmd){
            message.guild.me = message.guild.members.cache.get(this.bot.client.user.id);
        if (this.bot.client.cooldowns.has(`${message.author.id}-${cmd.config.name}`)) return message.react('733734783078760762');
        if (cmd.config.cooldown >= 1) {
        	this.bot.client.cooldowns.add(`${message.author.id}-${cmd.config.name}`);
        	setTimeout(() => {
            this.bot.client.cooldowns.delete(`${message.author.id}-${cmd.config.name}`);
        }, cmd.config.cooldown * 1000);}
        cmd.run(this.bot, message, args).catch(err => {
            console.error(err)
            message.say({embeds: [new this.bot.Embed().setColor([208, 0, 0]).setTimestamp().setDescription(`Упс... Что-то пошло не так...\n\`\`\`js\n${err.toString()}\n\`\`\``)]})
        })
    }
    }
};
