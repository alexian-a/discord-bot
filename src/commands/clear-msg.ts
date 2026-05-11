import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    TextChannel, 
    MessageFlags, 
    PermissionFlagsBits,
    GuildMember
} from 'discord.js';

import { roleId as rID } from '../utils/rolesID.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('clear-msg')
        .setDescription('Supprime des messages ou réinitialise complètement le salon.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => 
            option.setName('nombre')
                .setDescription('Le nombre de messages récents à supprimer (max 100)')
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addBooleanOption(option => 
            option.setName('nuke')
                .setDescription('⚠️ DANGER : Clone et supprime le salon pour le vider intégralement')
        ),

    async execute(interaction: ChatInputCommandInteraction) {

        const member = interaction.member as GuildMember;
        const hasPermission = member.roles.cache.has(rID.Admins) || member.roles.cache.has(rID.Managers);

        if (!hasPermission) {
            await interaction.reply({ 
                content: '❌ Accès refusé. Seuls les Administrateurs et les Managers peuvent utiliser le nettoyage.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const amount = interaction.options.getInteger('nombre');
        const nuke = interaction.options.getBoolean('nuke');
        const channel = interaction.channel as TextChannel;

        if (!channel) return;

        if (!amount && !nuke) {
            await interaction.reply({ 
                content: '❌ Vous devez spécifier un `nombre` de messages ou activer l\'option `nuke` !', 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        if (nuke) {
            await interaction.reply({ content: '💥 Lancement du protocole Nuke...', flags: MessageFlags.Ephemeral });

            try {
                const clonedChannel = await channel.clone({
                    position: channel.rawPosition 
                });

                await channel.delete();

                await clonedChannel.send(`💥 Ce salon a été entièrement purgé par ${interaction.user}.`);

            } catch (error) {
                console.error("Erreur lors du Nuke :", error);
            }
            return; 
        }

        if (amount) {
            await interaction.reply({ content: '🧹 Nettoyage en cours...', flags: MessageFlags.Ephemeral });

            try {
                const deletedMessages = await channel.bulkDelete(amount, true);

                await interaction.editReply({ 
                    content: `✅ Nettoyage terminé ! **${deletedMessages.size}** message(s) supprimé(s).` 
                });

            } catch (error) {
                console.error("Erreur lors du clear :", error);
                await interaction.editReply({ content: '❌ Une erreur est survenue lors de la suppression des messages.' });
            }
        }
    }
};