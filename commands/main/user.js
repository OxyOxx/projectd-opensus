module.exports = {
  config: {
    name: 'user',
    category: 'main',
    cooldown: 2,
    aliases: ['userinfo', 'ui', 'u'],
    description: 'Информация о пользователе.',
    usage: '<(@)пользователь/его id>'
  },
  run: async(bot, message, args) => {
    const moment = require('moment');
    let member, desc = '', onserv = false, flag = '', name;
    const user = message.mentions.users.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x)) || message.author;
    if(message.guild.members.cache.has(user.id)){
      onserv = true;
      member = message.mentions.members.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x), false) || message.member;
    }
    const created = util.diff(user.createdAt, new Date()).days;
      const status = {
          online: "<:online:770312891839545385>",
          idle: "<:idle:770312892142190612>",
          dnd: "<:dnd:770312892162637874>",
          offline: "<:offline:770312892191998013> **`Оффлайн`**",
      };    
    
      const flags = {
        VerifiedDeveloper: '<:coder:704749985459208252> ',
        HypeSquadOnlineHouse1: '<:bravery:704748399924215848> ',
        HypeSquadOnlineHouse2: '<:brilliance:704748399936667668> ',
        HypeSquadOnlineHouse3: '<:balance:704748399773089894> ',
        Hypesquad: '<:eventer:711209336910643232> ',
        PremiumEarlySupporter: '<:nitroSupporter:711209336554258504> ',
        Staff: '<:staff:724202344694153256> ',
        Partner: '<:discord:711209336981946408> ',
        EARLY_VERIFIED_DEVELOPER: ' '
      };
      const devices = {
        desktop: '**`ПК`**',
        web: '**`Браузер`**',
        mobile: '**`Смартфон`**'
      };

      if(onserv && member.presence?.clientStatus){
        for(let dev in member.presence.clientStatus){
          desc += `${status[member.presence.clientStatus[dev]]} ${devices[dev]} `;
        }
      } else if(onserv && member.presence?.clientStatus === null) {
        desc += status[member.presence.status];
      } else {
        desc += status.offline
      }

      if(onserv && message.guild.ownerId === user.id) flag += '<:guildOwner:711210965508816979> '

    if(user.bot) user.flags?.bitfield === 0 ? flag += '<:bot:704750919568326737> ' : flag += '<:verBot:704750919497154587> '
      else {
        if(user.flags !== undefined && user.flags?.bitfield !== undefined && user.flags?.bitfield !== 0){
          const flagArr = user.flags.toArray()
          for(const f of flagArr){
              flag += `${flags[f]}`
          }
        }
    }

    if(bot.client.guilds.cache.find(x => x.members.cache.has(user.id))){
        const m = bot.client.guilds.cache.find(x => x.members.cache.has(user.id)).members.cache.get(user.id);
        if(m && m.presence?.activities.length >= 1){

          if(m.presence.activities[0]) {
          if(m.presence.activities[0].type === 4){
            desc += '\n'
          if(m.presence.activities[0].emoji) desc += `${m.presence.activities[0].emoji.name} `
          if(m.presence.activities[0].state !== null){
            if(m.presence.activities[0].state.length >= 61) desc += `${m.presence.activities[0].state.slice(0, 60)}...`
            else desc += m.presence.activities[0].state 
              }
          }
          }
          m.presence.activities.map(async a => {
            if(a.type === 4) return;
            if(a.type === 0) desc += `\nИграет в ${a.details ? `[**\`${a.name}\`**](${message.url} "${a.details}")` : `**\`${a.name}\`**`}`;
            else if(a.type === 1) desc += `\nСтримит **[${a.state}](${a.url} "Twitch")**`;
            else if(a.type === 2) desc += `\nСлушает **\`${a.name}\`**([\`${a.details}\`](https://www.spotify.com/ "${a.state}"))`;
            else if(a.type === 3) desc += `\nСмотрит **[${a.name}](${a.url} "Twitch")**`;
            else if(a.type === 5) desc += `\nСоревнуется в **\`${a.name}\`**`
          })
        }
      }
      if(onserv && member.nickname !== null && member?.nickname !== undefined) name = `${user.tag} / ${member.nickname}`;
        else name = user.tag;
    let b = user.bot ? (await bot.rest.selfoauth.api.authorize.get({query: {client_id: user.id, scope: 'bot'}}))?.bot : 0;
    const emb = new bot.Embed()
    .setColor(onserv ? (member.roles?.highest.color === 0 ? '#fffffe' : member.roles?.highest.color) : '#fffffe')
    .setTimestamp()
    .setDescription(`${flag}\n${desc}${b ? `\nСерверов: **\`${b.approximate_guild_count}\`**` : ''}`)
    .setFooter({text: `ID: ${user.id}`})
    .addFields([{name: 'Создан:', value: moment.utc(user.createdAt).format(`**\`DD.MM.YYYY, HH:mm\`**`) + `\n(${created < 1 ? 'сегодня' : `**\`${created.toFixed()}\`** дн. назад`})`, inline: true}])
    .setThumbnail(user.avatarURL({dynamic: true, size: 1024, extension: 'png'}))
    .setAuthor({name: name});
    if(onserv){
      const joined = util.diff(member.joinedAt, new Date()).days;
      const roles = member.roles.cache.filter(r => r.id !== message.guild.id);
      emb.addFields([{name: 'Зашёл:', value: moment.utc(member.joinedAt).format(`**\`DD.MM.YYYY, HH:mm\`**`) + `\n(${joined < 1 ? 'сегодня' : `**\`${joined.toFixed()}\`** дн. назад`})`, inline: true},
        {name: `Роли [**\`${roles.size}\`**]:`, value: roles.sort((a, b) => b.position - a.position).map(r => r.toString()).slice(0, 15).join(', ') || '**`Нету`**', inline: false}]);
    }
    return message.say({embeds: [emb]})
  }
};
