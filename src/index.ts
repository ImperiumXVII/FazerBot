import { Client, Guild, Intents, TextChannel } from 'discord.js';
import { discordCommands } from './deploy-commands';
import { env } from './environment';
import { TwitchIntegration, TokenData } from './twitch-eventsub';
import { promises as fs } from 'fs';

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

client.login(env.DISCORD_TOKEN);

export var guild: Guild;
export var welcomeChannel: TextChannel;
export var debugChannel: TextChannel;
export var twitchChannel: TextChannel;
export var twitchIntegration: TwitchIntegration;

client.on('ready', async (bot) => {
	guild = client.guilds.cache.at(0)!;
	welcomeChannel = (await client.channels.fetch('940660352713109606'))! as TextChannel;
	debugChannel = (await client.channels.fetch('940751736925200424'))! as TextChannel;
	twitchChannel = (await client.channels.fetch('941001791649239041'))! as TextChannel;
	debugChannel.send(`It is now ${new Date().toLocaleString('en-gb')} and the bot is online! Woohoo!`);
	console.log(`Bot logged in as ${client.user?.username} at ${new Date().toLocaleString('en-gb')}`);
	discordCommands.init();

	await (async () => {
		const tokenData: TokenData = JSON.parse(await fs.readFile('./twitch-tokens.json', { encoding: 'utf-8' }));
		twitchIntegration = new TwitchIntegration(tokenData);
	})();

	twitchIntegration.init();
});