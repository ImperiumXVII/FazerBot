import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
	.setName('postgrouprequests')
	.setDescription('Creates the group request post.'),

 	async execute (interaction: CommandInteraction) {
		try {
			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('lgbt')
						.setLabel('LGBT')
						.setStyle('SECONDARY'),
				);

			await interaction.reply({ content: 'Debug', components: [row] });
		} catch(error) {
			console.error(error);
		}
	}
};