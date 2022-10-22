module.exports = {
  config: {
    name: 'eval',
    category: 'system',
    cooldown: 0,
    aliases: ['e', '>']
  },
  run: async(bot, message, args) => {
    try {
      if(!bot.client.config.owners.includes(message.author.id)) return;
      if(!args[0]) return message.say('>  А где код собственно?')
        args = args.join(' ').replace(/```js\n/, '').replace(/\n```/, '').split(/ /g);
        toEv = args.join(' ');
    if(args.includes('-a')){
      args = args.remove('-a');
      toEv = `(async() => {${args.join(' ').replace('```js\n', '').replace('\n```', '')}})()`
    }
      try {
        const inspected = require('util').inspect(await eval(toEv), {depth: 0, maxArrayLength: 32});
        if(inspected === 'undefined') return message.react('❓');
        message.say(`\`\`\`js\n${inspected}\`\`\``);
      } catch(error) {
        console.error(error)
        message.say(`**ОШИБКА**\n\`\`\`js\n${error}\`\`\``)
    }
  } catch(e) {
    console.error(e)
    message.say(`**ОШИБКА**\n\`\`\`js\n${e}\`\`\``)
  }
  }
};

