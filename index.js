const { Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config.json');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => qrcode.generate(qr, { small: true}));
client.on('ready', () => {
  console.log('🔥 J-BOT aktif & sederhana!');

  const chatId = `${config.target}@c.us`;
  client.sendMessage(chatId, '🔥 Bot aktif! Siap nyemprot!');
});

client.on('message', msg => {
  const text = msg.body.toLowerCase();
  if (config.greetings.includes(text)) {
    msg.reply(config.reply);
}
});

client.initialize();
