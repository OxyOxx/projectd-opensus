module.exports = {
  data: {
    name: 'clear',
    description: 'Очистить чат от зла',
    default_member_permissions: 1 << 13,
    options: [{
      type: 10,
      name: 'количество',
      description: 'Сколько удалить (до 100)',
      required: true
    },
    {
      type: 3,
      name: 'содержание',
      description: 'Примерное содержание сообщения'
    },
    {
      type: 9,
      name: 'от',
      description: 'Удалить сообщения от роль/участник'
    },
    {
      choices: [{name: 'да', value: '1'},
            {name: 'нет', value: '0'}],
      type: 3,
      name: 'вложение',
      description: 'Вложение в сообщении(ях)' 
    },
    {
      choices: [{name: 'да', value: '1'},
            {name: 'нет', value: '0'}],
      type: 3,
      name: 'ссылка',
      description: 'Ссылка в сообщении(ях)' 
    },
    {
      choices: [{name: 'да', value: '1'},
            {name: 'нет', value: '0'}],
      type: 3,
      name: 'эмодзи',
      description: 'Эмодзи в сообщении(ях)' 
    },
    {
      choices: [{name: 'да', value: '1'},
            {name: 'нет', value: '0'}],
      type: 3,
      name: 'стикер',
      description: 'Стикер в сообщении(ях)' 
    },
    {
      type: 7,
      name: 'канал',
      description: 'Где удалить'
    }]
  },
  async run(bot, interaction) {

    if(!interaction.guild.me.permissions.has('ManageMessages') || !interaction.guild.me.permissions.has('ReadMessageHistory')) return interaction.reply({ephemeral: true, content: 'Упс, похоже мне не хватает некоторых прав...'})
    const c = interaction.options.getNumber('количество');
    const count = c > 100 ? 100 : (c < 1 ? 1 : c),
    content = interaction.options.getString('содержание'),
    channel = interaction.options.getChannel('канал') || interaction.channel,
    from = interaction.options.getMentionable('от'),
    attachment = +interaction.options.getString('вложение'),
    link = +interaction.options.getString('ссылка'),
    emoji = +interaction.options.getString('эмодзи'),
    sticker = +interaction.options.getString('стикер');
    delete c;
    //мега крутой супер дупер код от сеньйор дискорд бот дев
    await interaction.reply({ephemeral: true, content: util.consts.replies[~~(Math.random() * util.consts.replies.length)]});
    // let msge = [];
    // for(let i = 0; i < 3; i++){
    //   msge.concat(await channel.messages.fetch({before: msge.at(-1)||undefined, limit: 100, cache: false}))
    // }

    let msge = await channel.messages.fetch({limit: 100})
    
    if(content) msge = msge.filter(x => x.content && x.content?.includes(content));
    if(from){
      if(from?.rawPosition && from.id !== interaction.guild.id) msge = msge.filter(x => x?.member?.roles.cache.has(from.id));
      else if(from?.tag) msge = msge.filter(x => x.author.id === from.id);
    }

    if(attachment) msge = msge.filter(x => x.attachments.size > 0)
    else if(attachment === 0) msge = msge.filter(x => x.attachments.size === 0);

    if(link) msge = msge.filter(x => x.content && util.consts.urlRegExp.test(x.content))
    else if(link === 0) msge = msge.filter(x => x.content && !util.consts.urlRegExp.test(x.content))

    if(emoji) msge = msge.filter(x => !x.content ? false : !!([...(x.content.match(/<a?:\w+:\d{18}>?/g) || []), ...(x.content.match(util.consts.emojiRegExp)||[])][0]))
    else if(emoji === 0) msge = msge.filter(x => !x.content ? false : !([...(x.content.match(/<a?:\w+:\d{18}>?/g) || []), ...(x.content.match(util.consts.emojiRegExp)||[])][0]));
    
    if(sticker) msge = msge.filter(x => x.stickers.first())
    else if(sticker === 0) msge = msge.filter(x => !x.stickers.first())
    
    if(!msge.first()) return await interaction.editReply(`Ничего не нашёл!!!`);
    console.log(msge.size)
    const res = await channel.bulkDelete(msge.map(x => x).slice(0, count));

    await interaction.editReply(`Нихера себе предъявы!!! УДАЛЕНО **${res.size}** !!!`);
  }
}
