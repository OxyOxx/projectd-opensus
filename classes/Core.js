const path = require("path");
const fs = require('fs');
const colors = require('colors/safe');
const Rest = require('./Rest.js');
const vision = require('@google-cloud/vision');
const { Shoukaku, Connectors } = require('shoukaku');
const Nodes = [{
    name: 'localhost',
    url: 'localhost:2334',
    auth: 'projectqwerty',
    secure: true
}];
const load = (dir, end) => {
    let results = [];
    for(let indir of fs.readdirSync(dir)){
        indir = path.resolve(dir, indir);
        const stat = fs.statSync(indir);
        if (stat.isDirectory()) results = results.concat(load(indir, end));
        if (stat.isFile() && indir.endsWith(end)) results.push(indir);
    }
    return results;
}
class Core {
    constructor(opt){
        this.client = new Discord.Client({intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildPresences,
            Discord.GatewayIntentBits.GuildScheduledEvents,
            Discord.GatewayIntentBits.MessageContent
        ]})
        this.client.commands = new Discord.Collection();
        this.client.cooldowns = new Set();
        this.client.config = opt.config;
        //this.manager = new Shoukaku(new Connectors.DiscordJS(this.client), Nodes);
        this.rest = {
            shiki: new Rest(`https://shikimori.one/api`),
            spotify: new Rest(`https://api.spotify.com/v1`, {headers: {Authorization: `Bearer ${opt.config.spotify[1]}`}}),
            googlevision: new vision.ImageAnnotatorClient({keyFilename: './google-vision.json'}),
            discord: {
                api: new Rest(`https://discord.com/api/v10`, {headers: {Authorization: `Bot ${opt.config.token}`}}),
                userapi: new Rest(`https://discord.com/api/v10`, {headers: {Authorization: opt.config.tokenself}}),
                oauth: new Rest(`https://discord.com/api/oauth2`, {headers: {Authorization: opt.config.tokenself}})
            }
        };
        this.Embed = Discord.EmbedBuilder;
        this.db = require('../utils/mongo.js');
        this.game = new (require('./Game.js'))();

        console.log(`
██████╗░██████╗░░█████╗░░░░░░██╗  ██████╗░███████╗██╗░░░░░████████╗░█████╗
██╔══██╗██╔══██╗██╔══██╗░░░░░██║  ██╔══██╗██╔════╝██║░░░░░╚══██╔══╝██╔══██╗
██████╔╝██████╔╝██║░░██║░░░░░██║  ██║░░██║█████╗░░██║░░░░░░░░██║░░░███████║
██╔═══╝░██╔══██╗██║░░██║██╗░░██║  ██║░░██║██╔══╝░░██║░░░░░░░░██║░░░██╔══██║
██║░░░░░██║░░██║╚█████╔╝╚█████╔╝  ██████╔╝███████╗███████╗░░░██║░░░██║░░██║
╚═╝░░░░░╚═╝░░╚═╝░╚════╝░░╚════╝░  ╚═════╝░╚══════╝╚══════╝░░░╚═╝░░░╚═╝░░╚═╝`);
        console.log(colors.bold.red(`[ProjectD]`), `Инициализация...`);
    }
    login(token){
        this.client.login(token);
        return this;
    }
    load(){
        const results = load("./commands/", ".js");
        for(const cmd of results){
            const command = require(cmd);
            this.client.commands.set(command.config.name, command);
        }
        console.log(colors.bold.red(`[ProjectD]`), `Загружено ${this.client.commands.size} комманд.`);

        fs.readdir('./events', (err, files) => {
            if (err) console.log(err);
            for(const evt of files.filter(x => x.endsWith('.js'))){
                const event = new (require(`../events/${evt}`))(this);
                this.client.on(event.evt, (...args) => event.run(...args));
            }
        });
        console.log(colors.bold.red(`[ProjectD]`), `Ивенты загружены.`);
        return this;
    }
}
module.exports = Core;
