const Rest = require('./Rest.js')
class Command {
    constructor(client, options) {
        this.client = client;
        this.Embed = Discord.MessageEmbed;
        this.config = {
            name: options.name,
            description: options.description || 'Нету.',
            usage: options.usage || null,
            category: options.category,
            cooldown: options.cooldown,
            aliases: options.aliases || []
        };
        this.db = require('../utils/mongo.js')
        this.rest = {
            //dl: new Rest(`https://dl-bot.xyz/api`),
            shiki: new Rest(`https://shikimori.one/api`)
        }
    }
    startCooldown(user, cmd) {
        this.client.cooldowns.add(`${user}-${cmd}`);
        setTimeout(() => {
            this.client.cooldowns.delete(`${user}-${cmd}`);
        }, this.config.cooldown * 1000);
    }
}

module.exports = Command;
