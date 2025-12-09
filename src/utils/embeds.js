import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Board } from '../models/Board.js';

export function createBoardEmbed(client) {
  const boards = Board.getAll();
  const activeCheckouts = Board.getAllActiveCheckouts();
  const randomColor = Math.floor(Math.random() * 0xFFFFFF);
  
  const embed = new EmbedBuilder()
    .setTitle('Board Management System')
    .setDescription('Use the buttons below to check in or check out boards.')
    .setColor(randomColor)
    .setThumbnail(client.user.displayAvatarURL())
    .setTimestamp();

  if (boards.length > 0) {
    const boardStatus = boards.map(board => {
      const checkout = activeCheckouts.find(c => c.board_id === board.id);
      return checkout
        ? `**${board.name}** - Checked out by <@${checkout.user_id}>`
        : `**${board.name}** - Available`;
    }).join('\n');
    
    embed.addFields({
      name: 'Board Status',
      value: boardStatus || 'No boards available'
    });
  }

  return embed;
}

export function createButtonRow() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('checkout_board')
        .setLabel('Check Out Board')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('checkin_board')
        .setLabel('Check In Board')
        .setStyle(ButtonStyle.Success)
    );
}

