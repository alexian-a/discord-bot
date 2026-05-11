import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    TextChannel,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionFlagsBits,
    MediaGalleryItemBuilder,
    MediaGalleryBuilder
} from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('setup-tickets')
        .setDescription('Configure le système de tickets.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {

        await interaction.reply({
            content: '⏳ Génération du panel V2 en cours...',
            flags: MessageFlags.Ephemeral
        });

        const channel = interaction.channel as TextChannel;

        const textDisplay = new TextDisplayBuilder()
            .setContent("# 🎟️ Bienvenue sur le support de **Los Santos Story**.\n\nVeuillez sélectionner la catégorie de votre demande dans le menu ci-dessous pour ouvrir un ticket privé avec notre équipe.\n");

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('menu_create_ticket')
            .setPlaceholder('Choisissez un sujet...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Questions')
                    .setDescription('Pour toute question concernant le serveur.')
                    .setValue('category_questions')
                    .setEmoji('❓'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Dossier')
                    .setDescription('Pour déposer ou suivre un dossier RP.')
                    .setValue('category_dossier')
                    .setEmoji('📁'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Bug')
                    .setDescription('Pour signaler un bug en jeu ou sur le Discord.')
                    .setValue('category_bug')
                    .setEmoji('🐛'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Admin & Fondateur')
                    .setDescription('Demande confidentielle à la direction.')
                    .setValue('category_admin')
                    .setEmoji('👑'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Boutique')
                    .setDescription('Problème avec un achat, un grade ou un don.')
                    .setValue('category_boutique')
                    .setEmoji('🛒')
            );

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        const banner = new MediaGalleryBuilder()
            .addItems(
                new MediaGalleryItemBuilder()
                    .setURL('attachment://support.png')
            );

        const container = new ContainerBuilder()
            .addMediaGalleryComponents(banner)
            .addTextDisplayComponents(textDisplay)
            .addActionRowComponents(actionRow);

        await channel.send({
            components: [container],
            files: [{ attachment: './assets/support.png', name: 'support.png' }],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.editReply({
            content: '✅ Panel V2 généré avec succès !'
        });
    }
}