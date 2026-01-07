import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder, MessageFlags } from 'discord.js';
import { Board } from '../models/Board.js';

export async function handleButton(interaction) {
  if (interaction.customId === 'checkout_board') {
    const availableBoards = Board.getAll().filter(board => !Board.getActiveCheckout(board.id));
    
    if (availableBoards.length === 0) {
      await interaction.reply({ content: 'No boards available.', flags: MessageFlags.Ephemeral });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('checkout_modal')
      .setTitle('Check Out Board');

    const boardSelect = new StringSelectMenuBuilder()
      .setCustomId('board_select')
      .setPlaceholder('Select a board')
      .setRequired(true)
      .addOptions(
        availableBoards.map(board => 
          new StringSelectMenuOptionBuilder()
            .setLabel(board.name)
            .setDescription(board.description || `Board ${board.id}`)
            .setValue(board.id.toString())
        )
      );

    const messageInput = new TextInputBuilder()
      .setCustomId('custom_message')
      .setLabel('Message (Optional)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Notes...')
      .setRequired(false)
      .setMaxLength(1000);

    modal.addLabelComponents(new LabelBuilder().setLabel('Board').setStringSelectMenuComponent(boardSelect));
    modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
    await interaction.showModal(modal);
    return;
  }

  if (interaction.customId === 'checkin_board') {
    const userCheckouts = Board.getUserCheckouts(interaction.user.id);
    
    if (userCheckouts.length === 0) {
      await interaction.reply({ content: 'No boards checked out.', flags: MessageFlags.Ephemeral });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('checkin_modal')
      .setTitle('Check In Board');

    const boardSelect = new StringSelectMenuBuilder()
      .setCustomId('board_select')
      .setPlaceholder('Select a board')
      .setRequired(true)
      .addOptions(
        userCheckouts.map(checkout => 
          new StringSelectMenuOptionBuilder()
            .setLabel(checkout.board_name)
            .setDescription(`Checked out ${new Date(checkout.checked_out_at).toLocaleDateString()}`)
            .setValue(checkout.board_id.toString())
        )
      );

    const messageInput = new TextInputBuilder()
      .setCustomId('custom_message')
      .setLabel('Message (Optional)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Notes...')
      .setRequired(false)
      .setMaxLength(1000);

    modal.addLabelComponents(new LabelBuilder().setLabel('Board').setStringSelectMenuComponent(boardSelect));
    modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
    await interaction.showModal(modal);
    return;
  }

  if (interaction.customId.startsWith('admin_boards_page_')) {
    const page = parseInt(interaction.customId.replace('admin_boards_page_', ''));
    const boards = Board.getAll();
    const startIdx = (page - 1) * 5;
    const pageBoards = boards.slice(startIdx, startIdx + 5);

    const modal = new ModalBuilder()
      .setCustomId(`admin_boards_page_${page}`)
      .setTitle(`Boards ${startIdx + 1}-${startIdx + pageBoards.length}`);

    pageBoards.forEach(board => {
      const checkout = Board.getActiveCheckout(board.id);
      const userSelect = new UserSelectMenuBuilder()
        .setCustomId(`board_${board.id}_user`)
        .setPlaceholder(checkout ? `${board.name}: ${checkout.username}` : `${board.name}`)
        .setRequired(false);

      const userLabel = new LabelBuilder()
        .setLabel(board.name)
        .setUserSelectMenuComponent(userSelect);

      modal.addLabelComponents(userLabel);
    });

    await interaction.showModal(modal);
  }
}

