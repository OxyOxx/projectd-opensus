module.exports = {
  config: {
    name: 'profile',
    category: 'main',
    cooldown: 3,
    aliases: ['card', 'lvl'],
    description: 'Статистика пользователя.',
    usage: '<@пользователь/его id>'
  },
  run: async(bot, message, args) => {
      const user = message.mentions.users.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x)) || message.author;
      const member = message.mentions.members.first() || await util.getUser(args, bot, message.guild.members.cache.map(x=>x), false) || message.member;
      let data = await bot.db.user.findOne({id: user.id}) || await bot.db.user.create({id: user.id});
      if(!data){
        await (new bot.db.user({id: user.id})).save();
        data = bot.db.user.findOne({id: user.id});
      };
      const guild = await bot.db.guild.findOne({id: message.guild.id});
      const lvl = data.level;
      const xp = data.xp;
      const toLvl = lvl**2 * (lvl*2) + 150 * lvl;
      const about = data.about;
      let toOldLvl;
      if(lvl != 1){
        toOldLvl = (lvl-1)**2 * ((lvl-1)*2) + 150;
      } else toOldLvl = 0
      const perc = (xp - toOldLvl) / (toLvl - toOldLvl)
      if(message.guild.data.profileType === 'embed'){
      const bar = '▰' + '▰'.repeat(perc * 9).padEnd(9, '▱')
      const emb = new bot.Embed()
      .setColor('#fffffe')
      .setTimestamp()
      .setAuthor({name:user.tag})
      .setThumbnail(user.avatarURL({size: 1024, dynamic: true, format: 'png'}))
      .setDescription(`Уровень: **\`${lvl}\`** **·** **\`${xp}/${toLvl}\`**\nДеньги: **\`${data.money.toLocaleString()} ${guild.ecoWallet}\`**\n${bar.replace(/▰+/g, s => `[${s}](${message.url} "${~~(perc * 100)}%")`)}`)
      return message.say({embeds: [emb]})//{thumbnail: {, width: 256, heigth: 256}}
    } else {
      let name;
      if(member.nickname !== null) name = member.nickname;
      const canvas = require('canvas');
      const avatar = await canvas.loadImage(user.avatarURL({format: 'png', size: 1024}));
      const Canvas = canvas.createCanvas(900, 450);
      const ctx = Canvas.getContext('2d');
      ctx.fillStyle = '#1E1E1E';
      ctx.fillRect(0, 0, 900, 500);
      ctx.fillStyle = '#FFF';
      ctx.font = 'Regular 25px Exo 2';
      ctx.textAlign = 'center';
      ctx.fillText(user.tag, 155, 315);
      ctx.font = 'Regular 18px Exo 2';
      ctx.textAlign = 'left';
      ctx.fillText(about, 30, 422);
      if(name){
        ctx.textAlign = 'center';
  ctx.font = 'Light 300 italic 20px Exo 2';
        ctx.fillText(name, 155, 350);
      };
      ctx.textAlign = 'center'
      ctx.font = 'Regular 30px Exo 2';
      ctx.fillText('Xp:', 480, 110);
      ctx.fillText('Lvl:', 680, 110);
      ctx.fillText('Money:', 480, 220);
      ctx.fillText('Bank:', 680, 220);
      ctx.font = 'Light 300 25px Exo 2';
      ctx.fillText(`${xp.toLocaleString()}/${toLvl.toLocaleString()}`, 480, 145);
      ctx.fillText(lvl.toLocaleString(), 680, 145);
      ctx.fillText(data.money.toLocaleString() + guild.ecoWallet, 480, 255);
      //ctx.fillText(data.bank.toLocaleString() + guild.ecoWallet, 680, 255);
      ctx.beginPath()
        ctx.strokeStyle = '#3F3F3F';
        ctx.lineCap = 'round';
        ctx.lineWidth = 8;
        ctx.moveTo(420, 345);
        ctx.lineTo(740, 345);
      ctx.stroke();
      ctx.beginPath()
        ctx.strokeStyle = '#FFFFFE';
        ctx.lineCap = 'round';
        ctx.lineWidth = 8;
        ctx.moveTo(420, 345);
        ctx.lineTo((perc * 320) + 420, 345);
      ctx.stroke();
      ctx.closePath()
      ctx.arc(155, 155, 125, 0, Math.PI * 2, true);
      ctx.clip()
      ctx.drawImage(avatar, 30, 30, 250, 250)
      message.say({files: [{ name: `profile-${Date.now()}.png`, attachment: Canvas.toBuffer()}]});
  }
}
};
