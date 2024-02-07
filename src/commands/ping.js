const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		const ping = sent.createdTimestamp - interaction.createdTimestamp;
		interaction.editReply(`🏓 Pong!\nRoundtrip latency: ${ping}ms`);
	},
};
