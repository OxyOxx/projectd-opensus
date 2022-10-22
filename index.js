Discord = require('discord.js');
// Pages = require('./classes/Pages.js');
util = require('./utils/util.js');
fetch = require('./utils/fetch');
const config = require('./config.js');
Math.random = () => require('crypto').randomBytes(4).readUInt32LE()/4294967295;
sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
require('canvas').registerFont('.fonts/Exo2-200.ttf', { family: 'Exo 2' });
const mongoose = require('mongoose');
mongoose.connect(config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
Discord.Message.prototype.say = function say(...args){
	return this.channel.send(...args);
};
mongoose.connection.on('connected', () => {
    console.log(colors.bold.red(`[ProjectD]`), colors.green('MongoDB'), 'подключена.');
});
String.prototype.toUp = function() {
	return this[0].toUpperCase() + this.slice(1);
};
Array.prototype.remove = function(...items){
	return this.filter(x => !items.includes(x));
};
const Core = require('./classes/Core.js');
const core = new Core({ config: config });
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
const load = (dir) => {
    let results = [];
    for(let indir of fs.readdirSync(dir)){
        indir = path.resolve(dir, indir);
        const stat = fs.statSync(indir);
        if (stat.isDirectory()) results = results.concat(load(indir, '.js'));
        if (stat.isFile() && indir.endsWith('.js')) results.push(indir);
    }
    return results;
};
Discord.mergeDefault = (a, b) => ({...a, ...b});
const results = load('./slashes/');
const body = [];
for (const file of results) {
	body.push(Discord.mergeDefault(util.consts.slashData, require(file).data));
};
//console.log(body[0])
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({version: '9'}).setToken(config.token);
rest.put(Routes.applicationCommands('559317617375051795'), { body })
	.then(() => console.log(colors.bold.red(`[ProjectD]`), 'Слэши заружены.'))
	.catch(console.error);
rest.put(
    Routes.applicationGuildCommands('559317617375051795', '742341747035865250'),
    { body: [{
        "name": "Информация",
        "type": 2
        },
        {
        "name": "OCR",
        "type": 3
        }]
    },
);

core.client.options.ws.properties.$browser = 'Discord Android'
core.login(config.token);
core.load();
