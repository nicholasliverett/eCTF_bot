import { EmbedBuilder, MessageFlags } from 'discord.js';
import { Board } from '../models/Board.js';

export async function handleViewBoardStatus(interaction) {
  const targetUser = interaction.targetUser;
  const userCheckouts = Board.getUserCheckouts(targetUser.id);
  
  if (userCheckouts.length === 0) {
    await interaction.reply({
      content: `${targetUser.tag} doesn't have any boards checked out.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`${targetUser.tag}'s Checked Out Boards`)
    .setColor(0xFFA500)
    .setThumbnail(targetUser.displayAvatarURL())
    .setDescription(
      userCheckouts.map(checkout => {
        const date = new Date(checkout.checked_out_at);
        return `**${checkout.board_name}**\n` +
               `Checked out: ${date.toLocaleString()}\n` +
               (checkout.custom_message ? `Note: ${checkout.custom_message}\n` : '') +
               `\n`;
      }).join('---\n')
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral
  });
}

