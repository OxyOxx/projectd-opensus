module.exports = {
  config: {
    name: 'settings',
    category: 'moder',
    cooldown: 2,
    aliases: ['options', 'params'],
    description: 'Настройки сервера.'
  },
  run: async(bot, message, args) => {
    const perm = message.member.permissions.has('MANAGE_GUILD') || bot.client.config.owners.includes(message.author.id);
    if(!perm) return message.say({embeds: [new bot.Embed().setColor('#fffffe').setTimestamp().setDescription('У тебя должно быть право на __управление сервером__.')]})
    const cmd = message.guild.data.prefix + message.content.split(/ /g)[0].slice(message.guild.data.prefix.length);
    const levels = new bot.Embed()
    .setColor('#fffffe')
    .setTimestamp()
    .setAuthor(message.guild.name, message.guild.iconURL({dynamic: true}))
    .setDescription(`\`${cmd} levels [on/off]\` - Включить/выключить уровни. (\`${message.guild.data.lvlStatus ? 'Включены' : 'Выключены'}.\`)
\`${cmd} levels blacklist <#канал/его id> <-del>\` - Добавить канал в чёрный список/убрать.`);

    const ecos = new bot.Embed()
    .setColor('#fffffe')
    .setTimestamp()
    .setAuthor(message.guild.name, message.guild.iconURL({dynamic: true}))
    .setDescription(`\`${cmd} eco [on/off]\` - Включить/выключить экономику. (\`${message.guild.data.ecoStatus ? 'Включены' : 'Выключены'}.\`)
\`${cmd} eco wallet [символ(ы)]\` - Установить символ валюты (Текущий: **\`${message.guild.data.ecoWallet}\`**).`);

    const emb = new bot.Embed()
    .setColor('#fffffe')
    .setTimestamp()
    .setAuthor(message.guild.name, message.guild.iconURL({dynamic: true}))
    .addField(`\`${cmd} prefix\``, `Установить префикс.\nТекущий: **\`${message.guild.data.prefix}\`**`, true)
    .addField(`\`${cmd} levels\``, `Настройки уровней.`, true)
    .addField(`\`${cmd} eco\``, `Настройки экономики.`, true)
    .addField(`\`${cmd} welcomeMsg\``, `Приветствие участника.`, true)
    .addField(`\`${cmd} bbMsg\``, `Прощание участнику.`, true)
    .addField(`\`${cmd} default\``, `Сбросить настройки.`, true)
    if(!args[0]) return message.say({embeds: [emb]})
    const e = (text, color = '#fffffe') => {
      return new bot.Embed().setColor(color).setTimestamp().setAuthor(message.guild.name, message.guild.iconURL({dynamic: true})).setDescription(text)
    }
    
    if(args[0] === 'prefix'){

      if(!args[1]) return message.say({embeds: [e(`Вы не указали префикс.`)]});
      if(args[1] === message.guild.data.prefix) return message.say({embeds: [e(`Данный префикс уже установлен.`)]});
      if(args[1].length >= 4) return message.say({embeds: [e(`Длинна префикса не должна превышать 4-х символов.`)]});
      
      const row = new Discord.MessageActionRow().addComponents(
               new Discord.MessageButton()
                    .setCustomId('confirm')
                    .setLabel('Да')
                    .setStyle('SUCCESS'),
            ).addComponents(
               new Discord.MessageButton()
                    .setCustomId('cancel')
                    .setLabel('Нет')
                    .setStyle('DANGER'),
            )
      const msg = await message.say({embeds: [e(`Вы действительно хотите сменить префикс на **\`${args[1]}\`** ?`)], components: [row]});
      const filter = i => ['confirm', 'cancel'].includes(i.customId) && i.user.id === message.author.id;
      const collector = message.channel.createMessageComponentCollector({ filter, time: 15000, max: 1 });
      collector.on('collect', async i => {
        if (i.customId === 'confirm') {
          await i.update({embeds: [e(`Префикс изменён на **\`${args[1]}\`**.`)], components: [] });
          collector.stop();
          message.guild.data.prefix = args[1];
          message.guild.data.save();
        } else if(i.customId === 'cancel'){
          await i.update({embeds: [e(`Префикс не будет сменён.`)], components: [] });
          collector.stop();
        }
      });
      collector.on('end', () => {
        if(message.guild.data.prefix === args[1]) msg.edit({embeds: [e(`Префикс не будет сменён.`)], components: []})
      })
    } else return message.say('> На переделке, скоре будет... или же нет.')
    if(args[0] === 'eco'){
      if(!args[1]) return message.say(ecos)

      if(args[1] === 'on'){

        if(message.guild.data.ecoStatus) return e(`Экономика уже включена.`);

        message.guild.data.ecoStatus = true;
        await message.guild.data.save();

        return e(`Теперь экономика включена.`);
      } else if(args[1] === 'off'){

        if(!message.guild.data.ecoStatus) return e(`Экономика уже выключена.`);

        message.guild.data.ecoStatus = false;
        await message.guild.data.save();

        return e(`Теперь экономика выключена.`);
      } else if(args[1] === 'wallet'){
        if(!args[2]) return e('Укажите символ(ы) валюты (до 3-х символов).');
        if(args[2].length >= 4) return e('Укажите символ(ы) валюты (до 3-х символов).');
        message.guild.data.ecoWallet = args[2];
        await message.guild.data.save();

        return e(`Теперь **\`${args[2]}\`** - символ(ы) валюты.`)
      }
    } else if(args[0] === 'levels'){
      if(!args[1]) return message.say(levels)

      if(args[1] === 'on'){

        if(message.guild.data.lvlStatus === true) return e(`Уровни уже включены.`);

        message.guild.data.lvlStatus = true;
        await message.guild.data.save();

        return e(`Теперь уровни включены.`);
      } else if(args[1] === 'off'){

        if(message.guild.data.lvlStatus === false) return e(`Уровни уже выключены.`);

        message.guild.data.lvlStatus = false;
        await message.guild.data.save();

        return e(`Теперь уровни выключены.`);
      } else if(args[1] === 'blacklist'){
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if(!channel) return e(`Использование - \`${cmd} levels blacklist <#канал/его id> <-del>\`\nПри добавлении канала в чёрный список, сообщения в нём, отправляемые участниками, не будут приносить опыт.\n\n**Список:**\n${message.guild.data.channels[0].map(x => message.guild.channels.cache.get(x)).join(', ')}`)
        if(args.slice(-1)[0] === '-del'){
          
          if(!message.guild.data.channels[0].includes(channel.id)) return e(`В ${channel} уже включены уровни.`);
          
          message.guild.data.channels[0] = message.guild.data.channels[0].remove(channel.id);
          await message.guild.data.save();
          
          return e(`Теперь в ${channel} работают уровни.`);
        }
        
        if(message.guild.data.channels[0].includes(channel.id)) return e(`В ${channel} уже отключены уровни.`);
        if(message.guild.data.channels[0].length > 20) return e(`Превышен лимит списка (максимум - 20 каналов).`);
        message.guild.data.channels[0].push(channel.id);
        await message.guild.data.save();
        return e(`Теперь в ${channel} отключены уровни.`)
      }
    } else if(args[0] === 'welcomeMsg'){
      return e('Ещё в разработке, я ленивая жопа...')
    } else if(args[0] === 'bbMsg'){
      return e('Ещё в разработке, я ленивая жопа...')
    } else if(args[0] === 'default'){
      const prm = message.guild.owner.id === message.member.id || bot.client.config.owners.includes(message.author.id);
      if(!prm) return e('Вернуть настройки к стандартным может только создатель сервера.');
      const filter = (reaction, user) => {
        return ['707942893687668796', '707942893322502206'].includes(reaction.emoji.id) && user.id === message.author.id;
      };
      const msg = await e('Вы точно хотите сбросить настройки сервера к стандартным?');
      msg.duse = true;
      for(const em of ['707942893687668796', '707942893322502206']){
        msg.react(em);
      }
      const collector = msg.createReactionCollector(filter, { time: 30000 });
      collector.on('collect', async(r, user) => {
        if(r.emoji.id === '707942893687668796'){
          msg.duse = false;
          await msg.edit(new bot.Embed().setColor('#fffffe').setTimestamp().setAuthor(message.guild.name, message.guild.iconURL({dynamic: true})).setDescription('Настройки сброшены к стандартным.'));
          const data = new bot.db.guild({guild: message.guild.id});
          message.guild.data = data;
          message.guild.data.save();
          collector.stop();
        } else if(r.emoji.id === '707942893322502206'){
          msg.duse = false;
          await msg.edit(new bot.Embed().setColor('#fffffe').setTimestamp().setAuthor(message.guild.name, message.guild.iconURL({dynamic: true})).setDescription('Настройки не будут сброшены к стандартным.'));
          collector.stop();
        }
      });
      collector.on('end', () => {
        if(msg.duse){
          msg.edit(new bot.Embed().setColor('#fffffe').setTimestamp().setAuthor(message.guild.name, message.guild.iconURL({dynamic: true})).setDescription('Время на выбор вышло.'));
          msg.reactions.removeAll();
        } else msg.reactions.removeAll();
      })
    }
  }
};