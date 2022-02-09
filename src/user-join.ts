import { TextChannel } from "discord.js";
import { client, debugChannel, guild } from ".";

client.on('guildMemberAdd', async (member) => {
	await member.roles.add('940666568835207248');
	const channel = await guild.channels.fetch('940751736925200424');
	await (channel as TextChannel).send(`${member.displayName} has joined the server. Added to group _"bandit"_ automatically.`);
	await debugChannel.send(`Welcome to BadGamerUK's Discord server, ${member.displayName}!`);
});