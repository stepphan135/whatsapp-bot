javascript
const fs = require('fs')
const { default: makeWASocket, useMultiFileAuthState} = require('@whiskeysockets/baileys')

async function startBot() {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
  const { state, saveCreds} = await useMultiFileAuthState('./session')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
})
  sock.ev.on('creds.update', saveCreds)

  const replies = config.responseStyle?.template || [
    "Ih! Kamu tuh ngeselin banget sih... 😤🙄",
    "Aku jawab bukan karena aku peduli ya! 😒✨",
    "Hmph! Jangan sok dekat gitu deh... 😳💢",
    "Ya ampun, maksa banget kamu... nih jawaban! 😑",
    "Cuma karena aku *baik*, bukan karena kamu spesial 😤😹"
  ]

  sock.ev.on('messages.upsert', async ({ messages}) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const sender = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    if (config.autoReply) {
      const reply = replies[Math.floor(Math.random() * replies.length)]
      await sock.sendMessage(sender, { text: reply}, { quoted: msg})
}
})
}

startBot()
