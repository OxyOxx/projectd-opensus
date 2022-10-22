module.exports = {
  data: {
    name: 'user',
    description: 'Информация о пользователе',
    options: [{
                name: 'пользователь',
                description: 'Пользователь',
                type: 6
              },
              {
                name: 'поиск',
                description: 'ID/часть имени/тег',
                type: 3
              }
            ]
  },
  async run(bot, interaction) {
    try {
            let user = interaction.user, onserv = !!interaction.guildId, member = onserv ? interaction.guild.members.cache.get(user.id) :  bot.client.guilds.cache.find(x => x.members.cache.has(user.id)).members.cache.get(user.id), desc = '', flag = '', name;
            const slash = interaction.options.getUser('пользователь'), addit = interaction.options.getString('поиск'), moment = require('moment');
            if(interaction.options?._hoistedOptions?.[0]?.name === 'user'){
              onserv ? (user = interaction.options._hoistedOptions[0].user, member = interaction?.options?._hoistedOptions[0]?.member) :
              (user = interaction.options._hoistedOptions[0].user, member = bot.client.guild.cache.find(x => x.members.cache.has(user.id)).members.cache.get(user.id))
            }
            if(slash && slash.id !== user.id) user = slash; member = onserv ? interaction.guild.members.cache.get(user.id) : bot.client.guilds.cache.find(x => x.members.cache.has(user.id)).members.cache.get(user.id);
            if(addit){
              user = await util.getUser(addit.split(/ /g), bot, interaction.guildId ? interaction.guild.members.cache.map(x=>x) : []) || interaction.user;
              member = onserv ? interaction.guild.members.cache.get(user?.id) : bot.client.guilds.cache.find(x => x.members.cache.has(user.id)).members.cache.get(user?.id)
              onserv = onserv ? !!member : false;
            }
            user = user ? user : interaction.user;
            
            const created = util.diff(user.createdAt, new Date()).days,
              status = {
                  online: "<:online:770312891839545385>",
                  idle: "<:idle:770312892142190612>",
                  dnd: "<:dnd:770312892162637874>",
                  offline: "<:offline:770312892191998013> **`Оффлайн`**",
              }, flags = {
                VerifiedDeveloper: '<:coder:704749985459208252> ',
                HypeSquadOnlineHouse1: '<:bravery:704748399924215848> ',
                HypeSquadOnlineHouse2: '<:brilliance:704748399936667668> ',
                HypeSquadOnlineHouse3: '<:balance:704748399773089894> ',
                Hypesquad: '<:eventer:711209336910643232> ',
                PremiumEarlySupporter: '<:nitroSupporter:711209336554258504> ',
                Staff: '<:staff:724202344694153256> ',
                Partner: '<:discord:711209336981946408> ',
                EARLY_VERIFIED_DEVELOPER: ' '
              }, devices = {
                desktop: '**`ПК`**',
                web: '**`Браузер`**',
                mobile: '**`Смартфон`**'
              };
    
            if(member){
              if(member.presence?.clientStatus){
                for(let dev in member.presence.clientStatus){
                  desc += `${status[member.presence.clientStatus[dev]]} ${devices[dev]} `;
                }
              } else if(member?.presence?.clientStatus === null) {
                desc += status[member.presence.status];
              } else {
                desc += status.offline
              }
        
              if(onserv && interaction?.guild?.ownerId === user.id) flag += '<:guildOwner:711210965508816979> '
            }
              
            if(user.bot) user.flags?.bitfield === 0 ? flag += '<:bot:704750919568326737> ' : flag += '<:verBot:704750919497154587> '
              else {
                if(user.flags !== undefined && user.flags?.bitfield !== undefined && user.flags?.bitfield !== 0){
                  const flagArr = user.flags.toArray()
                  for(const f of flagArr){
                      flag += `${flags[f]}`
                  }
                }
            }
        
                if(member && member?.presence?.activities.length >= 1){
        
                  if(member.presence.activities[0]) {
                  if(member.presence.activities[0].type === 4){
                    desc += '\n'
                  if(member.presence.activities[0].emoji) desc += `${member.presence.activities[0].emoji.name} `
                  if(member.presence.activities[0].state !== null){
                    if(member.presence.activities[0].state.length >= 61) desc += `${member.presence.activities[0].state.slice(0, 60)}...`
                    else desc += member.presence.activities[0].state 
                      }
                  }
                  }
                  member?.presence.activities.map(async a => {
                    if(a.type === 4) return;
                    if(a.type === 0) desc += `\nИграет в ${a.details ? `[**\`${a.name}\`**](https://discord.com/ "${a.details}")` : `**\`${a.name}\`**`}`;
                    else if(a.type === 1) desc += `\nСтримит **[${a.state}](${a.url} "Twitch")**`;
                    else if(a.type === 2) desc += `\nСлушает **\`${a.name}\`**([\`${a.details}\`](https://www.spotify.com/ "${a.state}"))`;
                    else if(a.type === 3) desc += `\nСмотрит **[${a.name}](${a.url} "Twitch")**`;
                    else if(a.type === 5) desc += `\nСоревнуется в **\`${a.name}\`**`
                  })
                }
              if(onserv && member?.nickname !== null && member?.nickname !== undefined) name = `${user.tag} / ${member.nickname}`;
                else name = user.tag;
            let b = user.bot ? (await bot.rest.discord.oauth.api.authorize.get({query: {client_id: user.id, scope: 'bot'}}))?.bot : 0;
            desc = `${flag}${desc[0] ? `\n${desc}` : ''}${b ? `\nСерверов: **\`${b.approximate_guild_count}\`**` : ''}`
            const emb = new bot.Embed({
              description: desc||'\u200b',
              color: onserv ? (member?.roles?.highest?.color === 0 ? 16777215 : member?.roles?.highest?.color) : 16777215,
              author: {name},
              thumbnail: {url: user.avatarURL({dynamic: true, size: 1024, format: 'png'})},
              footer: {text: `ID: ${user.id}`},
              fields: [{
                        name: 'Создан:', 
                        value: moment.utc(user.createdAt).format(`**\`DD.MM.YYYY, HH:mm\`**`) + `\n(${created < 1 ? 'сегодня' : `**\`${created.toFixed()}\`** дн. назад`})`, 
                        inline: true
                      }]
            }).setTimestamp();
            //.setTitle('test')
            // .setURL(`discord://-/users/${user.id}`)
            if(onserv){
              const joined = util.diff(member?.joinedAt, new Date()).days;
              const roles = member?.roles?.cache?.filter(r => r.id !== interaction?.guildId);
              emb.addFields([{name: 'Зашёл:', value: moment.utc(member?.joinedAt).format(`**\`DD.MM.YYYY, HH:mm\`**`) + `\n(${joined < 1 ? 'сегодня' : `**\`${joined.toFixed()}\`** дн. назад`})`, inline: true},
                {name: `Роли [**\`${roles.size}\`**]:`, value: roles.sort((a, b) => b.position - a.position).map(r => r.toString()).slice(0, 15).join(', ') || '**`Нету`**', inline: false}]);
            }
            return interaction.reply({embeds: [emb]})} catch(err) {console.log(err)}
  }
};
