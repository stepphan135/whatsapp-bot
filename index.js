const { Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config.json');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => qrcode.generate(qr, { small: true}));
client.on('ready', () => console.log('🔥 J-BOT aktif! Mood galak ON!'));

client.on('message', message => {
  const text = message.body.toLowerCase();
  if (config.greetings.includes(text)) {
    message.reply(config.reply + ' ' + config.emoji.soft);
}
});
client.initialize();
