import { PermissionFlagsBits, MessageFlags } from 'discord.js';
import { Board } from '../models/Board.js';
import { updatePanel } from '../utils/panel.js';

export async function handleSetPanelChannel(interaction, client) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: 'Administrator required.', flags: MessageFlags.Ephemeral });
    return;
  }

  const channel = interaction.options.getChannel('channel');
  if (!channel) {
    await interaction.reply({ content: 'Invalid channel.', flags: MessageFlags.Ephemeral });
    return;
  }

  Board.setPanelConfig(interaction.guild.id, channel.id, null);
  await updatePanel(client, interaction.guild.id);
  await interaction.reply({
    content: `Panel set to ${channel}.`,
    flags: MessageFlags.Ephemeral
  });
}

