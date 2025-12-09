import { Client, GatewayIntentBits, PermissionFlagsBits, ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { updatePanel } from './utils/panel.js';
import { handleViewBoardStatus } from './commands/viewBoardStatus.js';
import { handleManageBoard } from './commands/manageboard.js';
import { handleSetPanelChannel } from './commands/setpanelchannel.js';
import { handleButton } from './handlers/buttons.js';
import { handleModal } from './handlers/modals.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ]
});

const OWNER_ID = process.env.OWNER_ID;

client.on('interactionCreate', async interaction => {
  if (interaction.isUserContextMenuCommand()) {
    if (interaction.commandName === 'View Board Status') {
      await handleViewBoardStatus(interaction);
    }
    return;
  }

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'manageboard') {
      await handleManageBoard(interaction, OWNER_ID);
      return;
    }

    if (interaction.commandName === 'setpanelchannel') {
      await handleSetPanelChannel(interaction, client);
      return;
    }
  }

  if (interaction.isButton()) {
    await handleButton(interaction);
    return;
  }

  if (interaction.isModalSubmit()) {
    await handleModal(interaction, client, OWNER_ID);
  }
});

client.once('clientReady', async () => {
  logger.info(`Logged in as ${client.user.tag}!`);
  
  const commands = [
    {
      name: 'View Board Status',
      type: ApplicationCommandType.User
    },
    {
      name: 'manageboard',
      description: 'Manage board check-in/out for any user (Owner only)',
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    },
    {
      name: 'setpanelchannel',
      description: 'Set the channel for the board management panel (Admin only)',
      options: [
        {
          name: 'channel',
          type: ApplicationCommandOptionType.Channel,
          description: 'The channel where the board panel will be displayed',
          required: true
        }
      ],
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    }
  ];

  try {
    const registrationType = process.env.COMMAND_REGISTRATION?.toLowerCase() || 'global';
    
    if (registrationType === 'guild') {
      let guild = process.env.GUILD_ID ? client.guilds.cache.get(process.env.GUILD_ID) : null;
      if (!guild && process.env.GUILD_ID) {
        try {
          guild = await client.guilds.fetch(process.env.GUILD_ID);
        } catch (error) {
          logger.error(`Failed to fetch guild ${process.env.GUILD_ID}:`, error);
        }
      }
      if (!guild) guild = client.guilds.cache.first();
      
      if (guild) {
        await guild.commands.set(commands);
        logger.info(`Registered commands to guild: ${guild.name}`);
      } else {
        await client.application.commands.set(commands);
        logger.info('Registered commands globally');
      }
    } else {
      await client.application.commands.set(commands);
      logger.info('Registered commands globally');
    }
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
  
  client.guilds.cache.forEach(guild => {
    updatePanel(client, guild.id).catch(err => logger.error(`Failed to update panel for ${guild.id}:`, err));
  });
});

client.on('error', error => logger.error('Discord client error:', error));
process.on('unhandledRejection', error => logger.error('Unhandled promise rejection:', error));

const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.error('DISCORD_TOKEN is not set in environment variables!');
  process.exit(1);
}

if (!OWNER_ID) {
  logger.error('OWNER_ID is not set in environment variables!');
  process.exit(1);
}

client.login(token);
