// src/handlers/ticketHandler.ts
import { 
    StringSelectMenuInteraction, 
    ButtonInteraction, 
    ChannelType, 
    PermissionsBitField, 
    MessageFlags,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    TextDisplayBuilder,
    ContainerBuilder,
    TextChannel
} from 'discord.js';
import { roleId as rID } from '../utils/rolesID.js';


const ticketConfig: Record<string, { categoryId: string, roleIds: string[], label: string }> = {
    'category_questions': {
        categoryId: '1348295365098733601', 
        roleIds: [rID.Supports, rID.Staffs, rID.Admins, rID.Managers],     
        label: 'Questions'
    },
    'category_dossier': {
        categoryId: '1474116969903947807', 
        roleIds: [rID.Supports, rID.Staffs, rID.Admins, rID.Managers],    
        label: 'Dossier RP'
    },
    'category_bug': {
        categoryId: '1348295565255118858', 
        roleIds: [rID.Supports, rID.Staffs, rID.Admins, rID.Managers],   
        label: 'Signalement de Bug'
    },
    'category_boutique': {
        categoryId: '1348297278141501470', 
        roleIds: [rID.Supports, rID.Staffs, rID.Admins, rID.Managers],     
        label: 'Boutique & Dons'
    },
    'category_admin': {
        categoryId: '1348297056690634843', 
        roleIds: [rID.Admins, rID.Managers],    
        label: 'Contact Admin & Fonda'
    }
};

const serverSettings = {
    archiveCategoryId: '1348372562446385322',
    logChannelId: '1348373413596627046'
};

export async function handleTicketSelectMenu(interaction: StringSelectMenuInteraction) {

    await interaction.reply({ 
        content: '⏳ Création de votre ticket en cours...', 
        flags: MessageFlags.Ephemeral 
    });

    await interaction.message.edit({ 
        components: interaction.message.components,
        flags: MessageFlags.IsComponentsV2
    }).catch(() => console.log("Impossible de rafraîchir le menu"));

    try {
        const selectedValue = interaction.values[0];

        if (!selectedValue) {
            await interaction.editReply({ content: '❌ Catégorie introuvable.' });
            return;
        }

        const guild = interaction.guild;
        if (!guild) return;

        const config = ticketConfig[selectedValue];

        if (!config) {
            await interaction.editReply({ content: '❌ Catégorie introuvable.' });
            return;
        }

        const activeCategoryIds = Object.values(ticketConfig).map(c => c.categoryId);

        const existingTicket = guild.channels.cache.find(channel => {
            if (channel.type !== ChannelType.GuildText) return false;
            
            const parentId = channel.parentId;
            if (!parentId || !activeCategoryIds.includes(parentId)) return false;

            const userPermission = (channel as TextChannel).permissionOverwrites.cache.get(interaction.user.id);
            
            return userPermission && userPermission.allow.has(PermissionsBitField.Flags.ViewChannel);
        });


        if (existingTicket) {
            await interaction.editReply({ 
                content: `❌ **Impossible !** Vous avez déjà un ticket ouvert ici : <#${existingTicket.id}>.` 
            });
            return;
        }

        const basePermissions = [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ];

        const staffPermissions = config.roleIds
            .filter(roleId => roleId !== undefined && roleId !== '')
            .map(roleId => ({
                id: roleId,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
            }));

        const finalPermissions = [...basePermissions, ...staffPermissions];

        const ticketChannel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: config.categoryId,
            topic: interaction.user.id, 
            permissionOverwrites: finalPermissions
        });

        await interaction.editReply({content:`✅ Votre ticket a été créé avec succès : ${ticketChannel}`})

        const roleMentions = config.roleIds.map(id => `<@&${id}>`).join(' ');
        // const pingMsg = await ticketChannel.send({ content: `${roleMentions}` });
        // await pingMsg.delete();

        const textDisplay = new TextDisplayBuilder()
            .setContent(`# 🎟️ Nouveau Ticket\nBienvenue <@${interaction.user.id}> !\nSujet : **${config.label}**.\n\nL'équipe va vous répondre au plus vite. Une fois le problème résolu, vous ou le staff pouvez cliquer sur le bouton ci-dessous pour fermer ce ticket.`);

        const closeButton = new ButtonBuilder()
            .setCustomId('btn_close_ticket') 
            .setLabel('🔒 Fermer')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(textDisplay)
            .addActionRowComponents(row);

        await ticketChannel.send({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        const logChannel = guild.channels.cache.get(serverSettings.logChannelId) as TextChannel;
        if (logChannel) {
            const timestamp = Math.floor(Date.now() / 1000);
            const logCreateText = new TextDisplayBuilder()
                .setContent(`# 🟢 Nouveau Ticket Ouvert\n- **Créateur :** <@${interaction.user.id}> (\`${interaction.user.id}\`)\n- **Catégorie :** ${config.label}\n- **Salon :** ${ticketChannel} (\`${ticketChannel.name}\`)\n- **Date :** <t:${timestamp}:F>`);
            
            const logContainer = new ContainerBuilder().addTextDisplayComponents(logCreateText);
            await logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 }).catch(console.error);
        }

    } catch (error) {
        console.error("❌ Erreur :", error);
        await interaction.editReply({ content: '❌ Erreur de création.' });
    }
}

export async function handleTicketButton(interaction: ButtonInteraction) {
    const channel = interaction.channel as TextChannel;
    if (!channel) return;
    const guild = interaction.guild;
    if (!guild) return;

    if (interaction.customId === 'btn_close_ticket') {
        await interaction.reply({ content: '🔒 Archivage du ticket en cours...', flags: MessageFlags.Ephemeral });

        const creatorId = channel.topic; 

        if (creatorId) {
            await channel.permissionOverwrites.delete(creatorId).catch(() => console.log("Impossible de retirer les perms"));
        }

        await channel.setParent(serverSettings.archiveCategoryId, { lockPermissions: false }).catch(console.error);

        const updatedText = new TextDisplayBuilder()
            .setContent(`# 🔒 Ticket Archivé\nCe ticket a été fermé par <@${interaction.user.id}> et archivé.\nLe créateur n'y a plus accès.\n\nStaff : Vous pouvez maintenant supprimer définitivement ce salon.`);

        const deleteButton = new ButtonBuilder()
            .setCustomId('btn_delete_ticket')
            .setLabel('🗑️ Supprimer')
            .setStyle(ButtonStyle.Danger);

        const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton);

        const updatedContainer = new ContainerBuilder()
            .addTextDisplayComponents(updatedText)
            .addActionRowComponents(newRow);

        await interaction.message.edit({
            components: [updatedContainer],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.editReply({ content: '✅ Le ticket a été archivé et le joueur retiré.' });
        
        const logChannel = guild.channels.cache.get(serverSettings.logChannelId) as TextChannel;
        if (logChannel) {
            const timestamp = Math.floor(Date.now() / 1000);
            const logCloseText = new TextDisplayBuilder()
                .setContent(`# 🔒 Ticket Archivé\n- **Salon :** ${channel} (\`${channel.name}\`)\n- **Fermé par :** <@${interaction.user.id}>\n- **Créateur initial :** <@${creatorId}>\n- **Date :** <t:${timestamp}:F>`);
            
            const logContainer = new ContainerBuilder().addTextDisplayComponents(logCloseText);
            await logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 }).catch(console.error);
        }
    
    }

    else if (interaction.customId === 'btn_delete_ticket') {
        await interaction.reply({ content: '🗑️ Suppression du ticket dans 5 secondes...', flags: MessageFlags.Ephemeral });

        const logChannel = guild.channels.cache.get(serverSettings.logChannelId) as TextChannel;
        if (logChannel) {
            const timestamp = Math.floor(Date.now() / 1000);
            const creatorId = channel.topic;
            const logDeleteText = new TextDisplayBuilder()
                .setContent(`# 🔴 Ticket Supprimé Définitivement\n- **Nom du salon :** \`${channel.name}\`\n- **Créateur initial :** <@${creatorId}>\n- **Supprimé par :** <@${interaction.user.id}>\n- **Date :** <t:${timestamp}:F>`);
            
            const logContainer = new ContainerBuilder().addTextDisplayComponents(logDeleteText);
            await logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 }).catch(console.error);
        }

        setTimeout(async () => {
            await channel.delete().catch(console.error);
        }, 5000);
    }
}