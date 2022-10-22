const ac = require('../utils/autocomplete.js');
module.exports = class {
    constructor(client) {
        this.bot = client;
        this.evt = 'interactionCreate'
    }
    async run(interaction){
        if(interaction.type === 4){
            return await ac[interaction.commandName](interaction);
        }
        if (interaction.type === 2) {
            let cmd = interaction.commandName.toLowerCase();
            if(interaction.options?._hoistedOptions?.[0]?.name === 'user' && interaction.commandName === 'Информация') cmd = 'user';
            delete require.cache[require.resolve(`../slashes/${cmd}.js`)]
            const command = require(`../slashes/${cmd}.js`);
            if (!command) return interaction.reply({ephemeral: true, content: `Хм... похоже, я не смог найти запустить слэш-команду **\`${cmd}}\`**`});
            try {
                if(interaction.guild){
                    interaction.guild.data = await this.bot.db.guild.findOne({id: interaction.guildId})
                    interaction.guild.me = interaction.guild.members.cache.get(this.bot.client.user.id);
                }
                await command.run(this.bot, interaction);
            } catch (e){console.log(e)}
        }
        
    }
}
