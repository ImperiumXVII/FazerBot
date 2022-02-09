import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import { client } from '.';
import { env } from './environment';

class BadGamerUKCommands {

	readonly commands: any[] = [];
	readonly commandFiles = fs.readdirSync('./build/commands').filter(file => file.endsWith('.js'));

	readonly rest = new REST({ version: '9' }).setToken(env.DISCORD_TOKEN);

	async init() {

		for (const file of this.commandFiles) {
			const command = require(`./commands/${file}`);
			this.commands.push(command.data.toJSON());
		}

		console.log('Started refreshing application (/) commands.');

		try {
			await this.rest.put(
				Routes.applicationGuildCommands("940739610475135088", "940660352713109604"),
				{ body: this.commands },
			);

			client.application!.commands.set(this.commands);

			console.log('Successfully reloaded application (/) commands:');

		} catch (error) {
			console.error(error);
		}
	}

}

export const discordCommands = new BadGamerUKCommands();