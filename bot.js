const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});

client.on('ready', () => {
  console.log(`Eingeloggt als ${client.user.tag}!`);
});

const logChannelID = config.logChannelId; 
const loggedMessages = new Set(); 
client.on('messageDelete', msg => {
  const logChannel = msg.guild.channels.cache.get(logChannelID);
  if (!logChannel) return console.log(`Konnte keinen Kanal mit der ID ${logChannelID} im Server ${msg.guild.name} finden`);
  
  const author = msg.author.username;
  const content = msg.content;
  const messageID = msg.id;

  if (loggedMessages.has(messageID)) return;
  
  logChannel.send(`Die Nachricht von ${author} wurde gelöscht: "${content}"`);
  msg.author.send(`Ihre Nachricht mit dem Wort "${content}" wurde gelöscht, da dieses Wort auf der Blacklist steht.`)
  
  loggedMessages.add(messageID);
});

client.on('message', msg => {
  if (msg.author.bot) return;

  const words = config.words;
  const content = msg.content.toLowerCase();

  if (words.some(word => content.includes(word.toLowerCase()))) {
    msg.delete()
      .then(() => {
        console.log(`Nachricht von ${msg.author.username} gelöscht: ${msg.content}`);
      })
      .catch(console.error);
  }
});

client.login(config.token);