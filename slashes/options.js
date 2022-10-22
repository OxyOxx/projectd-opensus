module.exports = {
  data: {
    name: 'options',
    description: 'Бот под ваши хотелки',
    default_member_permissions: 1 << 5,
    options: [
      {
        type: 1,
        name: 'prefix',
        description: 'Префикс сервера',
        options: [{
          type: 3,
          name: 'префикс',
          description: 'Новый префикс (до 4 симв.)'
        }]
      },
      {
        type: 2,
        name: 'economy',
        description: 'Настройки экономики',
        options: [{
          type: 1,
          name: 'status',
          description: 'Статус экономики'
        },
        {
          type: 1,
          name: 'symbol',
          description: 'Символ(ы) валюты',
          options: [{
            type: 3,
            name: 'символ',
            description: 'Новый(е) символ(ы)'
          }]
        }]
      }
    ]
  },
  async run(bot, interaction) {
    if(!(interaction.member.permissions.has('ManangeGuild') || bot.client.config.owners.includes(interaction.user.id))) return interaction.reply({ephemeral: true,embeds: [new bot.Embed().setColor('#fffffe').setTimestamp().setDescription('У тебя должно быть право на __управление сервером__.')]})
    interaction.guild.data = bot.client.guilds.cache.get(interaction.guildId).data || await bot.db.guild.findOne({id: interaction.guildId});
//     const levels = new bot.Embed()
//     .setColor('#fffffe')
//     .setTimestamp()
//     .setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true}))
//     .setDescription(`\`/options levels status\` - Включить/выключить уровни. (\`${interaction.guild.data.lvlStatus ? 'Включены' : 'Выключены'}.\`)
// \`/options levels blacklist [#канал]\` - Добавить/убрать канал в чёрный список.`);

//     const ecos = new bot.Embed()
//     .setColor('#fffffe')
//     .setTimestamp()
//     .setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true}))
//     .setDescription(`\`/options eco status\` - Включить/выключить экономику. (\`${interaction.guild.data.ecoStatus ? 'Включены' : 'Выключены'}.\`)
// \`/options eco symbol [символ]\` - Установить символ валюты (Текущий: **\`${interaction.guild.data.ecoWallet}\`**).`);
    let id = '';
    const chr = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for(let i = 0; i < 6; i++) id += chr[~~(Math.random() * chr.length)];
    // const info
    // const emb = new bot.Embed()
    // .setColor('#fffffe')
    // .setTimestamp()
    // .setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true}))
    // .addFields([{
    //     name: `\`/options prefix\``, value: `Установить префикс.\nТекущий: **\`${interaction.guild.data.prefix}\`**`
    //   }
    //   ])
    // .addField(, , true)
    // .addField(`\`/options levels\``, `Настройки уровней.`, true)
    // .addField(`\`/options eco\``, `Настройки экономики.`, true)
    // .addField(`\`/options welcomeMsg\``, `Приветствие участника.`, true)
    // .addField(`\`/options bbMsg\``, `Прощание участнику.`, true)
    // .addField(`\`/options default\``, `Сбросить настройки.`, true)
    //if(!args[0]) return interaction.say({embeds: [emb]})
    const e = (text, color = '#fffffe') => {
      return new bot.Embed().setColor(color).setTimestamp().setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL({dynamic: true})}).setDescription(text)
    }
    
    if(interaction.options._subcommand === 'prefix'){
      let prefix = interaction.options.getString('префикс');
      if(prefix) prefix = prefix.length > 4 ? prefix.slice(0, 4) : prefix;
      if(prefix && prefix !== 'default'){
        if(prefix === interaction.guild.data.prefix) return interaction.reply({ephemeral: true, embeds: [e(`Данный префикс уже установлен.`)]});
        const buttons = new Discord.ActionRowBuilder({
        components: [new Discord.ButtonBuilder({customId: `decline-${id}`, label: 'Нет', style: 4}),
              new Discord.ButtonBuilder({customId: `accept-${id}`, label: 'Да', style: 3})]
        })
        await interaction.reply({ephemeral: true, components: [buttons], embeds: [e(`Старый префикс: **\`${interaction.guild.data.prefix}\`**\nСтарый префикс: **\`${prefix}\`**\n**Ты точно хочешь его изменить?**`)]});
        const collector = interaction.channel.createMessageComponentCollector({time: 20000, max: 1});
        let ends;
        collector.on('collect', async i => {
          await interaction.member.fetch();
          if(!interaction.member.permissions.has('ManangeGuild')){
            await interaction.editReply({embeds: [e(`Упс, а у тебя уже нет прав...`)], components: [] });
            colelctor.stop();
          } else if(i.customId === `accept-${id}`) {
            await interaction.editReply({embeds: [e(`Префикс изменён на **\`${prefix}\`**.`)], components: [] });
            interaction.guild.data.prefix = prefix;
            collector.stop();
            interaction.guild.data.save();
          } else if(i.customId === `decline-${id}`){
            await i.update({embeds: [e(`Префикс не будет сменён.`)], components: [] });
            collector.stop();
          }
        });
        collector.on('end', () => {
          if(ends) interaction.editReply({components: [], embeds: [e(`Ты не успел нажать одну из кнопок, ничего не изменится.`)]});
        })
      }
    }
    //   if(!args[1]) return interaction.say({embeds: [e(`Вы не указали префикс.`)]});
    //   if(args[1] === interaction.guild.data.prefix) return interaction.say({embeds: [e(`Данный префикс уже установлен.`)]});
    //   if(args[1].length >= 4) return interaction.say({embeds: [e(`Длинна префикса не должна превышать 4-х символов.`)]});
      
    //   const row = new Discord.interactionActionRow().addComponents(
    //            new Discord.interactionButton()
    //                 .setCustomId('confirm')
    //                 .setLabel('Да')
    //                 .setStyle('SUCCESS'),
    //         ).addComponents(
    //            new Discord.interactionButton()
    //                 .setCustomId('cancel')
    //                 .setLabel('Нет')
    //                 .setStyle('DANGER'),
    //         )
    //   const msg = await interaction.say({embeds: [e(`Вы действительно хотите сменить префикс на **\`${args[1]}\`** ?`)], components: [row]});
    //   const filter = i => ['confirm', 'cancel'].includes(i.customId) && i.user.id === interaction.author.id;
      
    // } else return interaction.say('> На переделке, скоре будет... или же нет.')
    // if(args[0] === 'eco'){
    //   if(!args[1]) return interaction.say(ecos)

    //   if(args[1] === 'on'){

    //     if(interaction.guild.data.ecoStatus) return e(`Экономика уже включена.`);

    //     interaction.guild.data.ecoStatus = true;
    //     await interaction.guild.data.save();

    //     return e(`Теперь экономика включена.`);
    //   } else if(args[1] === 'off'){

    //     if(!interaction.guild.data.ecoStatus) return e(`Экономика уже выключена.`);

    //     interaction.guild.data.ecoStatus = false;
    //     await interaction.guild.data.save();

    //     return e(`Теперь экономика выключена.`);
    //   } else if(args[1] === 'wallet'){
    //     if(!args[2]) return e('Укажите символ(ы) валюты (до 3-х символов).');
    //     if(args[2].length >= 4) return e('Укажите символ(ы) валюты (до 3-х символов).');
    //     interaction.guild.data.ecoWallet = args[2];
    //     await interaction.guild.data.save();

    //     return e(`Теперь **\`${args[2]}\`** - символ(ы) валюты.`)
    //   }
    // } else if(args[0] === 'levels'){
    //   if(!args[1]) return interaction.say(levels)

    //   if(args[1] === 'on'){

    //     if(interaction.guild.data.lvlStatus === true) return e(`Уровни уже включены.`);

    //     interaction.guild.data.lvlStatus = true;
    //     await interaction.guild.data.save();

    //     return e(`Теперь уровни включены.`);
    //   } else if(args[1] === 'off'){

    //     if(interaction.guild.data.lvlStatus === false) return e(`Уровни уже выключены.`);

    //     interaction.guild.data.lvlStatus = false;
    //     await interaction.guild.data.save();

    //     return e(`Теперь уровни выключены.`);
    //   } else if(args[1] === 'blacklist'){
    //     const channel = interaction.mentions.channels.first() || interaction.guild.channels.cache.get(args[0]);
    //     if(!channel) return e(`Использование - \`/options levels blacklist <#канал/его id> <-del>\`\nПри добавлении канала в чёрный список, сообщения в нём, отправляемые участниками, не будут приносить опыт.\n\n**Список:**\n${interaction.guild.data.channels[0].map(x => interaction.guild.channels.cache.get(x)).join(', ')}`)
    //     if(args.slice(-1)[0] === '-del'){
          
    //       if(!interaction.guild.data.channels[0].includes(channel.id)) return e(`В ${channel} уже включены уровни.`);
          
    //       interaction.guild.data.channels[0] = interaction.guild.data.channels[0].remove(channel.id);
    //       await interaction.guild.data.save();
          
    //       return e(`Теперь в ${channel} работают уровни.`);
    //     }
        
    //     if(interaction.guild.data.channels[0].includes(channel.id)) return e(`В ${channel} уже отключены уровни.`);
    //     if(interaction.guild.data.channels[0].length > 20) return e(`Превышен лимит списка (максимум - 20 каналов).`);
    //     interaction.guild.data.channels[0].push(channel.id);
    //     await interaction.guild.data.save();
    //     return e(`Теперь в ${channel} отключены уровни.`)
    //   }
    // } else if(args[0] === 'welcomeMsg'){
    //   return e('Ещё в разработке, я ленивая жопа...')
    // } else if(args[0] === 'bbMsg'){
    //   return e('Ещё в разработке, я ленивая жопа...')
    // } else if(args[0] === 'default'){
    //   const prm = interaction.guild.owner.id === interaction.member.id || bot.client.config.owners.includes(interaction.author.id);
    //   if(!prm) return e('Вернуть настройки к стандартным может только создатель сервера.');
    //   const filter = (reaction, user) => {
    //     return ['707942893687668796', '707942893322502206'].includes(reaction.emoji.id) && user.id === interaction.author.id;
    //   };
    //   const msg = await e('Вы точно хотите сбросить настройки сервера к стандартным?');
    //   msg.duse = true;
    //   for(const em of ['707942893687668796', '707942893322502206']){
    //     msg.react(em);
    //   }
    //   const collector = msg.createReactionCollector(filter, { time: 30000 });
    //   collector.on('collect', async(r, user) => {
    //     if(r.emoji.id === '707942893687668796'){
    //       msg.duse = false;
    //       await msg.edit(new bot.Embed().setColor('#fffffe').setTimestamp().setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true})).setDescription('Настройки сброшены к стандартным.'));
    //       const data = new bot.db.guild({guild: interaction.guild.id});
    //       interaction.guild.data = data;
    //       interaction.guild.data.save();
    //       collector.stop();
    //     } else if(r.emoji.id === '707942893322502206'){
    //       msg.duse = false;
    //       await msg.edit(new bot.Embed().setColor('#fffffe').setTimestamp().setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true})).setDescription('Настройки не будут сброшены к стандартным.'));
    //       collector.stop();
    //     }
    //   });
    //   collector.on('end', () => {
    //     if(msg.duse){
    //       msg.edit(new bot.Embed().setColor('#fffffe').setTimestamp().setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true})).setDescription('Время на выбор вышло.'));
    //       msg.reactions.removeAll();
    //     } else msg.reactions.removeAll();
    //   })
    // }
  }
};
