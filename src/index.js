const { Client, IntentsBitField, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const path = require('path');
const loadFiles = require('./utils/loadFiles.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
client.commands = new Collection();

loadFiles(path.join(__dirname, 'commands'), (command, filePath) => {
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
});

loadFiles(path.join(__dirname, 'events'), (event) => {
  if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
});

client.login(process.env.BOT_TOKEN);
