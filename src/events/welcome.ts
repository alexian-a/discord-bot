import { Events, GuildMember, EmbedBuilder, TextChannel } from 'discord.js';

const WELCOME_CHANNEL_ID = '1348290166741139617';

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember) {
    try {
        const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID) as TextChannel;
        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#FACB23')
            .setTitle(`👋 Bienvenue sur Los Santos Story !`)
            .setDescription(`Salut ${member} ! Nous sommes ravis de te voir parmi nous.\n\nN'oublie pas de lire le <#1347914311691141172>`)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setTimestamp()
            .setFooter({ text: `Membre n°${member.guild.memberCount}` });

        await channel.send({ embeds: [welcomeEmbed] });

    } catch (error) {
        console.error("Erreur lors de l'accueil :", error);
    }
}