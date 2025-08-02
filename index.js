javascript
const fs = require('fs')
const { default: makeWASocket, useMultiFileAuthState} = require('@whiskeysockets/baileys')

const delay = ms => new Promise(res => setTimeout(res, ms))
let lastReplyTime = 0

async function startBot() {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
  const { state, saveCreds} = await useMultiFileAuthState('./session')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
})

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages}) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const sender = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    if (!text.trim()) return

    const now = Date.now()
    const minInterval = 5000 // anti-spam: minimal 5 detik antar balasan
    if (now - lastReplyTime < minInterval) return
    lastReplyTime = now

    console.log(`📨 Dapat pesan dari ${sender}: ${text}`)

    await delay(Math.floor(Math.random() * 3000) + 2000) // delay 2–5 detik sebelum balasan

    const triggers = config.triggers || {}
    for (let keyword in triggers) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        await sock.sendMessage(sender, { text: triggers[keyword]}, { quoted: msg})
        return
}
}

    if (config.autoReply) {
      const templates = config.responseStyle?.template || []
      const reply = templates[Math.floor(Math.random() * templates.length)]
      await sock.sendMessage(sender, { text: reply}, { quoted: msg})
}
})
}

startBot()
