import { Client, GatewayIntentBits, Partials, Events, Collection, MessageFlags } from 'discord.js';
import 'dotenv/config';

import { command as setupTickets } from './commands/setup-tickets.js';
import { command as clearMsg } from './commands/clear-msg.js'; 

import * as welcomeEvent from './events/welcome.js';


import { handleTicketSelectMenu, handleTicketButton } from './handlers/ticketHandler.js';
import { allCommands } from './commands/_index.js';
import { handleReactionRole } from './events/messageReaction.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction 
    ]
});

const commands = new Collection<string, any>();
for (const command of allCommands) {
    commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Succès ! Le bot est connecté en tant que ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    
    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Oups, une erreur !', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'Oups, une erreur !', flags: MessageFlags.Ephemeral });
            }
        }
    }

    else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'menu_create_ticket') {
            await handleTicketSelectMenu(interaction);
        }
    }

    else if (interaction.isButton()) {
        if (interaction.customId === 'btn_close_ticket' || interaction.customId === 'btn_delete_ticket') {
            await handleTicketButton(interaction);
        }
    }
});

// Welcome message
client.on(welcomeEvent.name, (...args) => welcomeEvent.execute(...args));

// Réaction rôle
client.on(Events.MessageReactionAdd, (reaction, user) => handleReactionRole(reaction, user, true));
client.on(Events.MessageReactionRemove, (reaction, user) => handleReactionRole(reaction, user, false));

// Login du bot
client.login(process.env.DISCORD_TOKEN);