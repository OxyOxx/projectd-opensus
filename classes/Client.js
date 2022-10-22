const path = require("path");
const fs = require('fs');
const dp = require('discord-player');
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
class Client extends Discord.Client {
	constructor(opt){
		super();
		this.commands = new Discord.Collection();
        this.cooldowns = new Set();
		this.config = opt.config;
		console.log(`
██████╗░██████╗░░█████╗░░░░░░██╗███████╗░█████╗░████████╗  ██████╗░
██╔══██╗██╔══██╗██╔══██╗░░░░░██║██╔════╝██╔══██╗╚══██╔══╝  ██╔══██╗
██████╔╝██████╔╝██║░░██║░░░░░██║█████╗░░██║░░╚═╝░░░██║░░░  ██║░░██║
██╔═══╝░██╔══██╗██║░░██║██╗░░██║██╔══╝░░██║░░██╗░░░██║░░░  ██║░░██║
██║░░░░░██║░░██║╚█████╔╝╚█████╔╝███████╗╚█████╔╝░░░██║░░░  ██████╔╝
╚═╝░░░░░╚═╝░░╚═╝░╚════╝░░╚════╝░╚══════╝░╚════╝░░░░╚═╝░░░  ╚═════╝░`);
		console.log(`[ProjectD] Инициализация...`);
	}
	login(token){
		super.login(token);
		return this;
	}
	load(bot){
        const results = load("./commands/", ".js");
        for(const cmd of results){
            const command = require(cmd);
            this.commands.set(command.config.name, command);
        }
        console.log(`[ProjectD] Загружено ${this.commands.size} комманд.`);

        fs.readdir('./events', (err, files) => {
            if (err) console.log(err);
            for(const evt of files){
                const event = new (require(`../events/${evt}`))(bot);
                super.on(event.evt, (...args) => event.run(...args));
            }
        });
        console.log(`[ProjectD] Ивенты загружены.`);
        return this;
	}
}
module.exports = Client;
