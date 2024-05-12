const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const TIME_LIMIT = 60 * 1000; // 60 Seconds

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
      const host = interaction.user;
      // Play against bot if opponent is not specified
      const opponent = interaction.options.getUser('opponent') ?? client.user;
      const winningScore = interaction.options.getInteger('winning_score') ?? 3;
      let hostScore = 0, opponentScore = 0;

      if (host.id === opponent.id) {
        return interaction.reply({ content: 'You cannot play against yourself.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('Rock Paper Scissors')
        .setDescription(`${host} 💬\n${opponent} 💬`);

      const buttons = choices.map((choice) => {
        return new ButtonBuilder()
          .setCustomId(choice.name)
          .setLabel(choice.name)
          .setEmoji(choice.emoji)
          .setStyle(ButtonStyle.Primary)
      });

      const buttonsRow = new ActionRowBuilder().addComponents(buttons);

      const response = await interaction.reply({
        content: `${host} VS ${opponent}`,
        embeds: [embed],
        components: [buttonsRow],
      });

      const hostPromise = awaitPlayerChoice(host, embed, interaction);
      const opponentPromise = !opponent.bot ? awaitPlayerChoice(opponent, embed, interaction) : getComputerChoice(opponent, embed, interaction);
      const results = await Promise.all([hostPromise, opponentPromise]);

      embed.setDescription(`${host} ✅\n${opponent} ✅`);
      interaction.editReply({ embeds: [embed], components: [] });

      if (results[0] && results[1]) {
        const hostDetails = { player: host, choice: getChoiceObj(results[0].customId) };
        const hostChoice = getChoiceObj(results[0].customId);
        const opponentChoice = !opponent.bot ? getChoiceObj(results[1].customId) : opponentPromise;
        let resultMessage;
        if (hostChoice.beats === opponentChoice.name) {
          resultMessage = `${hostChoice.emoji} beats ${opponentChoice.emoji} - ${host} wins!`;
        } else if (opponentChoice.beats === hostChoice.name) {
          resultMessage = `${opponentChoice.emoji} beats ${hostChoice.emoji} - ${opponent} wins!`;
        } else {
          resultMessage = 'It\'s a tie!';
        }
        await interaction.followUp({ content: resultMessage });
      } else {
        await interaction.followUp({ content: 'Error: Could not get both players\' responses.', ephemeral: true });
      }
    } catch (error) {
      console.log("Error with /rps");
      console.error(error);
    }
	},
};

async function awaitPlayerChoice(player, embed, interaction) {
  return interaction.channel.awaitMessageComponent({
      filter: (i) => i.user.id === player.id && i.isButton(),
      time: TIME_LIMIT
  })
  .then(i => {
    embed.setDescription(embed.data.description.replace(`${player} 💬`, `${player} ✅`));
    interaction.editReply({ embeds: [embed] });
    return i;
  })
  .catch(() => {
    const embedGameOver = new EmbedBuilder()
      .setTitle('Game Over')
      .setDescription(`${player} did not respond in time.`);
    interaction.editReply({ embeds: [embedGameOver], components: [] });
    return null;
  });
}

function getComputerChoice(opponent, embed, interaction) {
  embed.setDescription(embed.data.description.replace(`${opponent} 💬`, `${opponent} ✅`));
  interaction.editReply({ embeds: [embed] });
  return choices[Math.floor(Math.random() * choices.length)];
}

function getChoiceObj(name) {
  return choices.find(choice => choice.name === name);
}

function hasWinner(hostScore, opponentScore, winningScore) {
  return hostScore >= winningScore || opponentScore >= winningScore;
}
