const db = require('./mongo.js');
module.exports = {
	async reminds(interaction) {
		const data = (await db.remind.find({id: new RegExp(interaction.options._hoistedOptions[0].value)})).slice(0, 5);
		return interaction.respond(data.map(x => ({name: x.id, value: x.id})))
	}
}
