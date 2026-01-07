import { ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';

export async function handleManageBoard(interaction, ownerId) {
  if (interaction.user.id !== ownerId) {
    await interaction.reply({ content: 'Owner only.', flags: MessageFlags.Ephemeral });
    return;
  }

  const page1Button = new ButtonBuilder()
    .setCustomId('admin_boards_page_1')
    .setLabel('Page 1: Boards 1-5')
    .setStyle(ButtonStyle.Primary);

  const page2Button = new ButtonBuilder()
    .setCustomId('admin_boards_page_2')
    .setLabel('Page 2: Boards 6-10')
    .setStyle(ButtonStyle.Primary);

  const page3Button = new ButtonBuilder()
    .setCustomId('admin_boards_page_3')
    .setLabel('Page 3: Boards 11-15')
    .setStyle(ButtonStyle.Primary);

  const page4Button = new ButtonBuilder()
    .setCustomId('admin_boards_page_4')
    .setLabel('Page 4: Boards 16-20')
    .setStyle(ButtonStyle.Primary);

  await interaction.reply({
    content: 'Select a page:',
    components: [
      new ActionRowBuilder().addComponents(page1Button, page2Button),
      new ActionRowBuilder().addComponents(page3Button, page4Button)
    ],
    flags: MessageFlags.Ephemeral
  });
}

