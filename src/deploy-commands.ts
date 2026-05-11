import { REST, Routes } from 'discord.js';
import 'dotenv/config';

import { allCommands } from './commands/_index.js';

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    throw new Error("❌ ERREUR CRITIQUE : Il manque le TOKEN ou le CLIENT_ID dans le .env !");
}

const commandsData = allCommands.map(command => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log(`⏳ Envoi de ${commandsData.length} commande(s) à l'API Discord...`);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commandsData },
    );

    console.log(`✅ SUCCÈS : Les commandes ont été déployées sur Discord !`);
} catch (error) {
    console.error("❌ Une erreur est survenue lors de l'envoi :", error);
}