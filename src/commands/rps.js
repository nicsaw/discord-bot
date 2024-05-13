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

      if (host.id === opponent.id) {
        return interaction.reply({ content: 'You cannot play against yourself.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`0 - 0`)
        .setDescription(` `);

      const buttons = choices.map((choice) => {
        return new ButtonBuilder()
          .setCustomId(choice.name)
          .setLabel(choice.name)
          .setEmoji(choice.emoji)
          .setStyle(ButtonStyle.Primary)
      });

      const buttonsRow = new ActionRowBuilder().addComponents(buttons);

      const response = await interaction.reply({
        content: `**Rock Paper Scissors**\nFirst to ${winningScore} wins!\n${host} VS ${opponent}`,
        embeds: [embed],
        components: [buttonsRow],
      });

      const hostInfo = { player: host, choice: null, score: 0 };
      const opponentInfo = { player: opponent, choice: null, score: 0 };

      while (!hasWinner(hostInfo.score, opponentInfo.score, winningScore)) {
        embedUpdateDescription(`${embed.data.description}\n\n${host} 💬\n${opponent} 💬`, embed, interaction);

        const hostPromise = awaitPlayerChoice(host, response, embed, interaction);
        const opponentPromise = !opponent.bot ? awaitPlayerChoice(opponent, response, embed, interaction) : getComputerChoice(opponent, embed, interaction);

        const results = await Promise.all([hostPromise, opponentPromise]);
        if (!(results[0] && results[1])) return await interaction.followUp({ content: 'Error: Could not get both players\' responses.' });

        // embedUpdateDescription(`${host} ✅\n${opponent} ✅`, embed, interaction);

        hostInfo.choice = getChoiceObj(results[0].customId);
        opponentInfo.choice = !opponent.bot ? getChoiceObj(results[1].customId) : opponentPromise;

        embedUpdateDescription(pickRoundWinner(hostInfo, opponentInfo), embed, interaction);
        embedUpdateTitle(`${hostInfo.score} - ${opponentInfo.score}`, embed, interaction);
      }

      clearButtons(interaction);
      embedUpdateDescription(`${embed.data.description}\n\n${hostInfo.score > opponentInfo.score ? host : opponent} WINS!`, embed, interaction);
    } catch (error) {
      console.log("Error with /rps");
      console.error(error);
    }
	},
};

async function awaitPlayerChoice(player, response, embed, interaction) {
  return response.awaitMessageComponent({
    filter: (i) => i.user.id === player.id && i.isButton(),
    time: TIME_LIMIT
  })
    .then(i => {
      embedUpdateDescription(embed.data.description.replace(`${player} 💬`, `${player} ✅`), embed, interaction);
      return i;
    })
    .catch(() => {
      embedUpdateDescription(`Game over. ${player} did not respond in time.`, embed, interaction);
      clearButtons(interaction);
      return null;
    });
}

function embedUpdateTitle(newTitle, embed, interaction) {
  embed.setTitle(newTitle);
  interaction.editReply({ embeds: [embed] });
}

function embedUpdateDescription(newDescription, embed, interaction) {
  embed.setDescription(newDescription);
  interaction.editReply({ embeds: [embed] });
}

function clearButtons(interaction) {
  interaction.editReply({ components: [] });
}

function getComputerChoice(opponent, embed, interaction) {
  embed.setDescription(embed.data.description.replace(`${opponent} 💬`, `${opponent} ✅`));
  interaction.editReply({ embeds: [embed] });
  return choices[Math.floor(Math.random() * choices.length)];
}

function pickRoundWinner(host, opponent) {
  if (host.choice.beats === opponent.choice.name) {
    host.score++;
    return `${host.player} ${host.choice.emoji} beats ${opponent.player} ${opponent.choice.emoji}!`;
  } else if (opponent.choice.beats === host.choice.name) {
    opponent.score++;
    return `${opponent.player} ${opponent.choice.emoji} beats ${host.player} ${host.choice.emoji}!`;
  } else {
    return `Both players picked ${host.choice.emoji} - it\'s a tie!`;
  }
}

function getChoiceObj(name) {
  return choices.find(choice => choice.name === name);
}

function hasWinner(hostScore, opponentScore, winningScore) {
  return hostScore >= winningScore || opponentScore >= winningScore;
}
