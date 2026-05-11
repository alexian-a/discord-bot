import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { roleId } from '../utils/rolesID.js';


const reactionRoles: Record<string, Record<string, string>> = {
    '1487583828263305358': { // ID du message
        '1483862780577841152': roleId.Membre, // ID Réaction - Role Membre
    }
};

export async function handleReactionRole(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    isAdding: boolean
) {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('❌ Impossible de récupérer le message:', error);
            return;
        }
    }

    const messageId = reaction.message.id;
    const emojiIdentifier = reaction.emoji.id;

    if (emojiIdentifier && reactionRoles[messageId] && reactionRoles[messageId][emojiIdentifier]) {
        const roleToModify = reactionRoles[messageId][emojiIdentifier];
        const guild = reaction.message.guild;
        if (!guild) return;

        try {
            const member = await guild.members.fetch(user.id);

            if (isAdding) {
                await member.roles.add(roleToModify);
                console.log(`✅ Rôle ajouté à ${user.tag}`);
            } else {
                await member.roles.remove(roleToModify);
                console.log(`➖ Rôle retiré à ${user.tag}`);
            }

        } catch (error) {
            console.error("❌ Erreur lors de la modification du rôle :", error);
        }
    }
}