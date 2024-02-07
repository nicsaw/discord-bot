const { SlashCommandBuilder } = require('discord.js');

const choices = [
  { name: 'Rock', emoji: '🪨', beats: 'Scissors' },
  { name: 'Paper', emoji: '📄', beats: 'Rock' },
  { name: 'Scissors', emoji: '✂️', beats: 'Paper' }
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Rock Paper Scissors')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('The opponent you want to challenge'))
    .addIntegerOption(option =>
      option.setName('winning_score')
        .setDescription('First to reach this score wins the match')),
	async execute(client, interaction) {
    try {
      const targetUser = interaction.options.getUser('opponent') ?? client.user;
      const winningScore = interaction.options.getInteger('winning_score') ?? 3;
      let homeScore = 0, awayScore = 0;

      interaction.reply(`🛠️ Game under construction, please check back later 😄`);
    } catch (error) {
      console.error(error);
    }
	},
};

const getComputerChoice = () => choices[Math.floor(Math.random() * choices.length)];
