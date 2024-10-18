// Load environment variables from the .env file
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Access environment variables
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const commands = [];

// Set the path to the 'utility' subfolder inside the 'commands' folder
const foldersPath = path.join(__dirname, 'utility');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

// Load each command's data for deployment
for (const file of commandFiles) {
	const filePath = path.join(foldersPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy the commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// Catch and log any errors
		console.error(error);
	}
})();
