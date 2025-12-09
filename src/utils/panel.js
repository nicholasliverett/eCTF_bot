import { Board } from '../models/Board.js';
import { logger } from './logger.js';
import { createBoardEmbed, createButtonRow } from './embeds.js';

export async function updatePanel(client, guildId) {
  try {
    const config = Board.getPanelConfig(guildId);
    if (!config || !config.channel_id) return;

    const channel = await client.channels.fetch(config.channel_id);
    if (!channel) return;

    const embed = createBoardEmbed(client);
    const buttons = createButtonRow();

    if (config.message_id) {
      try {
        const message = await channel.messages.fetch(config.message_id);
        await message.edit({ embeds: [embed], components: [buttons] });
        return;
      } catch (error) {
        logger.warn(`Panel message not found, creating new one: ${error.message}`);
      }
    }

    const message = await channel.send({ embeds: [embed], components: [buttons] });
    Board.setPanelConfig(guildId, config.channel_id, message.id);
  } catch (error) {
    logger.error(`Failed to update panel for guild ${guildId}:`, error);
  }
}

