const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Displays a list of commands'),
	async execute(client, interaction) {
    let reply = '';
    client.commands.forEach((value, key) => reply += `/${key} - ${value.data.description}\n`);
    interaction.reply(reply);
	},
};
