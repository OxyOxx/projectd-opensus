module.exports = {
	data: {
		name: 'ocr',
		description: 'Распознать текст',
		options: [{
			type: 11,
			name: 'вложение',
			description: 'Картинка',
			required: true
		}]
	},
	async run(bot, interaction){
		await interaction.deferReply();
		const url = interaction.options._hoistedOptions?.[0]?.message?.attachments.first().url || interaction.options.getAttachment('вложение').url;
		if(!url) return interaction.reply({ephemeral: true, content: 'Вложений нет'});
		const d = Date.now();
		const path = `./assets/downloaded/${d}.${url.split(/\./g).at(-1)}`;
		await util.downloadImage(url, path);
		const result = (await bot.rest.googlevision.textDetection(path))[0].textAnnotations;
		require('fs').unlinkSync(path);
		if(result[0].description.length > 2000) return interaction.editReply({content: '> **OCR**', files: [{ name: `${d}.txt`, attachment: Buffer.from(result[0].description, 'utf-8')}]})
		else return interaction.editReply({embeds: [new bot.Embed({author: {name: 'OCR'},color: 16777215, description: `\`\`\`${result[0].description}\`\`\``})]});
		
	}
}
