import { Client, Intents, TextChannel } from 'discord.js';
import { env } from './environment';

const client = new Client({ 
	intents: [
		Intents.FLAGS.GUILDS, 
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_PRESENCES
	]
});

client.login(env.DISCORD_TOKEN);

client.on('ready', async (bot) => {
	const debugChannel = await bot.channels.fetch('940751736925200424') as TextChannel;
	debugChannel.send(`It is now ${new Date()} and the bot is online! Woohoo!`);
});