import { EmbedBuilder } from 'discord.js';
import { logger } from './logger.js';

export async function notifyOwner(client, ownerId, action, boardName, user, customMessage) {
  try {
    const owner = await client.users.fetch(ownerId);
    
    const embed = new EmbedBuilder()
      .setTitle(`Board ${action}`)
      .setDescription(`**Board:** ${boardName}\n**User:** ${user.tag} (${user.id})\n**Action:** ${action}`)
      .setColor(action === 'Checked Out' ? 0xFF6B6B : 0x51CF66)
      .setTimestamp();

    if (customMessage) {
      embed.addFields({
        name: 'Custom Message',
        value: customMessage
      });
    }

    await owner.send({ embeds: [embed] });
  } catch (error) {
    logger.error(`Failed to send DM to owner:`, error);
  }
}

