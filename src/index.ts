import { Client, Guild, Intents, TextChannel } from 'discord.js';
import { env } from './environment';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';

const commands: any[] = [];
const commandFiles = fs.readdirSync('./build/commands').filter(file => file.endsWith('.js'));

export const client = new Client({ 
	intents: [
		Intents.FLAGS.GUILDS, 
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES
	]
});

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(env.DISCORD_TOKEN);

client.login(env.DISCORD_TOKEN);

export var guild: Guild;
export var welcomeChannel: TextChannel;
export var debugChannel: TextChannel;

client.on('ready', async (bot) => {
	guild = client.guilds.cache.at(0)!;
	welcomeChannel = (await client.channels.fetch('940660352713109606'))! as TextChannel;
	debugChannel = (await client.channels.fetch('940751736925200424'))! as TextChannel;
	debugChannel.send(`It is now ${new Date().toLocaleString('en-gb')} and the bot is online! Woohoo!`);
	console.log(`Bot logged in as ${client.user?.username} at ${new Date().toLocaleString('en-gb')}`);

	await rest.put(
		Routes.applicationGuildCommands(client.user!.id, guild.id),
		{ body: commands },
	);
});