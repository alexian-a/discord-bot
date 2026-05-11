# 🤖 Wicked — Discord Bot

## Français

### 📝 Description
Bot Discord pour la modération et le support du projet **Wicked** (Los Santos Story).

### ✨ Fonctionnalités
- 🎟️ **Tickets V2** : Panel interactif de sélection (Questions, Dossier, Bug, Admin, Boutique).
- ⌨️ **Commandes Slash** : `/setup-tickets`, `/clear-msg`.
- 👋 **Bienvenue** : Accueil automatisé des nouveaux membres.
- 🎭 **Rôles** : Attribution automatique de rôles via réactions.

### 🚀 Installation rapide
```bash
git clone https://github.com/alexian-a/discord-bot

cd bot-discord

npm install
```

### ⚙️ Configuration
Créez un fichier `.env` à la racine :
```env
DISCORD_TOKEN=votre_token_bot
CLIENT_ID=votre_id_application
```

### 🛠️ Scripts utiles
| Commande | Action |
|----------|--------|
| `npm run dev` | Démarre le bot en mode développement (rechargement auto) |
| `npm run build`| Compile le code TypeScript |
| `npm start` | Lance le bot compilé |
| `npm run deploy`| Déploie les commandes Slash sur Discord |

---

## English

### 📝 Description
Discord bot for **Wicked** project moderation and support.

### ✨ Features
- 🎟️ **Tickets V2**: Interactive category selection panel.
- ⌨️ **Slash Commands**: `/setup-tickets`, `/clear-msg`.
- 👋 **Welcome**: Automated welcome messages.
- 🎭 **Roles**: Reaction-based role assignment.

### 🚀 Quick Start
```bash
git clone https://github.com/alexian-a/discord-bot

cd bot-discord

npm install
```

### ⚙️ Setup
Create a `.env` file at the root level:
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
```

### 🛠️ Useful Scripts
| Command | Action |
|---------|--------|
| `npm run dev` | Starts the bot in dev mode (auto-reload) |
| `npm run build`| Compiles TypeScript code |
| `npm start` | Runs the compiled bot |
| `npm run deploy`| Deploys Slash Commands to Discord |
