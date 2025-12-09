import { MessageFlags } from 'discord.js';
import { Board } from '../models/Board.js';
import { updatePanel } from '../utils/panel.js';
import { notifyOwner } from '../utils/notifications.js';

export async function handleModal(interaction, client, ownerId) {
  if (interaction.customId === 'checkout_modal') {
    const boardId = parseInt(interaction.fields.getStringSelectValues('board_select')[0]);
    const customMessage = interaction.fields.getTextInputValue('custom_message')?.trim() || null;
    const board = Board.getById(boardId);
    
    if (!board) {
      await interaction.reply({ content: 'Board not found.', flags: MessageFlags.Ephemeral });
      return;
    }

    const activeCheckout = Board.getActiveCheckout(board.id);
    if (activeCheckout) {
      await interaction.reply({
        content: `Already checked out by <@${activeCheckout.user_id}>.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    Board.checkout(board.id, interaction.user.id, interaction.user.tag, customMessage);
    await interaction.reply({
      content: `Checked out **${board.name}**!`,
      flags: MessageFlags.Ephemeral
    });
    await updatePanel(client, interaction.guild.id);
    await notifyOwner(client, ownerId, 'Checked Out', board.name, interaction.user, customMessage);
    return;
  }

  if (interaction.customId === 'checkin_modal') {
    const boardId = parseInt(interaction.fields.getStringSelectValues('board_select')[0]);
    const customMessage = interaction.fields.getTextInputValue('custom_message')?.trim() || null;
    const board = Board.getById(boardId);
    
    if (!board) {
      await interaction.reply({ content: 'Board not found.', flags: MessageFlags.Ephemeral });
      return;
    }

    const userCheckouts = Board.getUserCheckouts(interaction.user.id);
    if (!userCheckouts.some(c => c.board_id === board.id)) {
      await interaction.reply({
        content: `You don't have this board checked out.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    Board.checkin(board.id, interaction.user.id);
    await interaction.reply({
      content: `Checked in **${board.name}**!`,
      flags: MessageFlags.Ephemeral
    });
    await updatePanel(client, interaction.guild.id);
    await notifyOwner(client, ownerId, 'Checked In', board.name, interaction.user, customMessage);
    return;
  }

  if (interaction.customId.startsWith('admin_boards_page_')) {
    const page = parseInt(interaction.customId.replace('admin_boards_page_', ''));
    const boards = Board.getAll();
    const startIdx = (page - 1) * 5;
    const pageBoards = boards.slice(startIdx, startIdx + 5);
    const updates = [];

    for (const board of pageBoards) {
      const fieldId = `board_${board.id}_user`;
      let targetUser = null;
      
      try {
        const selectedUsers = interaction.fields.getSelectedUsers(fieldId);
        if (selectedUsers?.size > 0) {
          targetUser = selectedUsers.first();
        }
      } catch (e) {
        // Empty select
      }

      const checkout = Board.getActiveCheckout(board.id);

      if (targetUser) {
        if (checkout?.user_id === targetUser.id) continue;
        if (checkout) Board.checkin(board.id, checkout.user_id);
        Board.checkout(board.id, targetUser.id, targetUser.tag, null);
        updates.push(`**${board.name}** → ${targetUser.tag}`);
        await notifyOwner(client, ownerId, 'Checked Out', board.name, targetUser, null);
      } else if (checkout) {
        Board.checkin(board.id, checkout.user_id);
        updates.push(`**${board.name}** → Available`);
        const previousUser = await client.users.fetch(checkout.user_id).catch(() => null);
        if (previousUser) await notifyOwner(client, ownerId, 'Checked In', board.name, previousUser, null);
      }
    }

    await updatePanel(client, interaction.guild.id);
    await interaction.reply({
      content: updates.length > 0 ? updates.join('\n') : 'No changes.',
      flags: MessageFlags.Ephemeral
    });
  }
}

