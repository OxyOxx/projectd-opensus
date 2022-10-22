module.exports = {
  config: {
    name: 'help',
    category: 'main',
    cooldown: 2,
    aliases: ['h', 'cmds'],
    description: 'Список команд.',
    usage: '<команда>'
  },
  run: async(bot, message, args) => {
    if(!args[0]){
        const help = new bot.Embed()
        .setColor('#fffffe')
        .setTimestamp()
        .setAuthor({name: 'Список команд'});
        for(const category of ['main', 'moder', 'fun', 'nsfw']){
          const cat = bot.client.commands.filter(x => x.config.category === category);
          help.addFields([{name: `${category.toUp()} [**\`${cat.size}\`**]:`, value: `${cat.map(x => `\`${x.config.name}\``).join(', ')}`, inline: false}])
        }
        return message.say({embeds:[help]});
      } else {
        const command = bot.client.commands.find(x => x.config.name === args[0]) || bot.client.commands.find(x => x.config.aliases.includes(args[0]));
        if(!command) return message.say(`> Я не нашёл команду с названием или вариацией **\`${args[0]}\`**.`);
        const help = new bot.Embed()
        .setColor('#fffffe')
        .setAuthor({name: 'Помощь по команде'})
        .addFields([
            {name: 'Команда:', value: `**\`${command.config.name}\`**`, inline: true},
            {name: 'Описание:', value: `**\`${command.config?.description??'Нету'}\`**`, inline: true},
            {name: 'Использование:', value: `**\`${message.guild.data.prefix}${command.config.name}${!command.config?.usage ? '' : ` ${command.config.usage}`}\`**`, inline: false},
            {name: 'Категория:', value: `**\`${command.config.category.toUp()}\`**`, inline: true},
            {name: 'Задержка:', value: `**\`${command.config.cooldown} сек.\`**`, inline: true},
            {name: 'Вариации:', value: `**\`${command.config?.aliases ? command.config?.aliases.join('`**, **`') : 'Нету'}\`**`, inline: true},
          ])
        .setTimestamp()
        return message.say({embeds: [help]});
  }
}
}
