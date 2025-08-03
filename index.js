const { Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config.json');
const fs = require('fs');

let greetingCounter = {};

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => qrcode.generate(qr, { small: true}));
client.on('ready', () => console.log('🔥 J-BOT aktif! Mood galak ON!'));

client.on('message', msg => {
  const chatId = msg.from;
  const text = msg.body.toLowerCase();
  const hour = new Date().getHours();

  const startHour = parseInt(config.activehours.start.split(":")[0]);
  const endHour = parseInt(config.activehours.end.split(":")[0]);

  if (hour>= startHour && hour <= endHour) {
    if (!greetingCounter[chatId]) greetingCounter[chatId] = 0;

    if (config.greetings.includes(text)) {
      greetingCounter[chatId]++;
      const mood = greetingCounter[chatId]> config.maxGreetingBeforeAngry
? config.emoji.angry
: config.emoji.soft;

      msg.reply(`${config.reply} ${mood}`);
} else if (config.compliment.includes(text)) {
      msg.reply(`Apa sih… boss galak nyapa terus 😤 ${config.emoji.turn}`);
}
} else {
    msg.reply(`⏱️ Jam segini J-BOT lagi rebahan. Besok nyemprot lagi ya 😴`);
}

  fs.appendFileSync('chat-log.txt', `${msg.from} ➜ ${msg.body}\n`);
});

client.initialize();
