module.exports = {
  config: {
    name: 'clear',
    category: 'moder',
    cooldown: 0,
    aliases: ['cmsg', 'prune'],
    description: 'Очистить чат от сообщений (до 100 за раз).',
    usage: '[кол-во до 100] <-content/-user/-images> <"содержимое"/ пользователь/его ID> '
  },
  run: async(bot, message, args) => {
    const emb = new bot.Embed()
    .setTimestamp()
    .setColor('#fffffe');
    if(!message.channel.permissionsFor(message.member).has("MANAGE_MESSAGES")) return message.say({embeds: [emb.setDescription('У тебя должно быть право на __управление сообщениями__.')]});
    if(!message.channel.permissionsFor(message.guild.me).has("VIEW_CHANNEL")) return message.say({embeds: [emb.setDescription('У меня должно быть право на __просмотр сообщений__.')]});
    if(!message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES")) return message.say({embeds: [emb.setDescription('У меня должно быть право на __управление сообщениями__.')]});
    await message.channel.messages.fetch();
    if(!args[0]) return message.say({embeds: [emb.setDescription(`Укажи кол-во удаляемых сообщений (от 1 до 100).`)]});
    const amount = +args[0] <= 0 ? 1 : (+args[0] >= 100 ? 100 : +args[0]);
    if(args.includes('-content')){
      args = args.remove('-content');
      const content = args.join(' ').match(/"([^"]+)"/);
      if(!content || content) return message.say({embeds: [emb.setDescription('Вы не указали содержание в кавычках ("содержание").')]});
      args = args.join(' ').replace(content[0], '').split(/ +/g);
      const Fuse = new (require('fuse.js'))(message.channel.messages.cache.array(), {keys: ["content"], treshold: 0.9})
      const arr = Fuse.search(args.slice(1).join(' ')).slice(0, amount);
      if(!arr[0]) return message.say({embeds: [emb.setDescription(`Я не нашёл сообщения с содержанием **\`${args.slice(1).join(' ')}\`**.`)]});
      const m = await message.say({embeds: [emb.setDescription('Начинаю удалять...')]});

      await m.edit({embeds: [emb.setDescription(`Удалено **\`${arr.length}\`**(найденных) сообщений с содержанием`)]})
    }
    
  }
};