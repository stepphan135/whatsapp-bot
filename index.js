js
const fs = require('fs');
const { Client} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const greetingCount = {};
const logStream = fs.createWriteStream('./chat-log.txt', { flags: 'a'});

const client = new Client();

const getMoodToday = () => {
  const moods = ['tsundere', 'ngambek', 'lembek', 'galak', 'sok cool'];
  const today = new Date().getDay(); // 0 = Sunday
  return moods[today % moods.length];
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 10) return 'pagi';
  if (hour < 16) return 'siang';
  if (hour < 20) return 'sore';
  return 'malam';
};

client.on('qr', qr => qrcode.generate(qr, { small: true}));

client.on('ready', () => {
  console.log('J-BOT tsundere deluxe aktif... bukan karena aku peduli ya 🙄');
});

client.on('message', msg => {
  const text = msg.body.toLowerCase();
  const sender = msg.from;
  const mood = getMoodToday();
  const timeNow = getTimeGreeting();

  // Logging pesan masuk
  logStream.write(`[${new Date().toLocaleString()}] ${sender}: ${text}\n`);

  greetingCount[sender] = (greetingCount[sender] || 0) + 1;
  const gCount = greetingCount[sender];

  const { greetings, compliments} = config.triggers;
  const emoji = config.mood.emoji;
  const maxGreeting = config.mood.maxGreetingBeforeAngry;

  let reply = '';

  if (greetings.some(g => text.includes(g))) {
    if (gCount> maxGreeting) {
      reply = `Nyapa terus tuh ganggu tau! Aku lagi ${mood} ${emoji.angry}`;
} else {
      reply = `Selamat ${timeNow}... bukan karena aku mau nyapa balik ya ${emoji.turn}`;
}
} else if (compliments.some(c => text.includes(c))) {
    reply = `APAAN SIH?! Kamu sok tahu... tapi... ya makasih juga sih ${emoji.soft}`;
} else if (text.includes('ping')) {
    reply = `PONG! Lagi ${mood}, jangan ganggu aku ${emoji.angry}`;
} else if (text.includes('apa kabar')) {
    reply = `Kenapa nanya sih? Tapi aku... baik kok ${emoji.soft}`;
} else {
    reply = `Aku lagi ${mood}, gak mood jawab kamu ${emoji.reply}`;
}

  msg.reply(reply);
});

client.initialize();
