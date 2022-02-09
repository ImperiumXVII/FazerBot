import { Interaction, MessageActionRow, MessageButton } from "discord.js";
import { debugChannel } from "..";

import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
	.setName('echo')
	.setDescription('Replies with your input!')
	.addStringOption(option =>
		option.setName('input')
			.setDescription('The input to echo back')
			.setRequired(true)),

 	async execute (interaction: Interaction) {
		if (!interaction.isCommand()) return;
		if(interaction.channel?.id !== "940751736925200424") return;
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('lgbt')
					.setLabel('LGBT')
					.setStyle('SECONDARY'),
			);

		await debugChannel.send({ content: 'Debug', components: [row] });
	}
};