javascript
const fs = require('fs')
const { default: makeWASocket, useMultiFileAuthState} = require('@whiskeysockets/baileys')

const delay = ms => new Promise(res => setTimeout(res, ms))
let lastReplyTime = 0

function isActiveNow(start, end) {
  const now = new Date()
  const [h, m] = [now.getHours(), now.getMinutes()]
  const current = h * 60 + m
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM
  return current>= startTotal && current <= endTotal
}

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

    if (!isActiveNow(config.activeHours.start, config.activeHours.end)) return

    const now = Date.now()
    const minInterval = 5000
    if (now - lastReplyTime < minInterval) return
    lastReplyTime = now

    console.log(`📨 Dapat pesan dari ${sender}: ${text}`)
    await delay(Math.floor(Math.random() * 3000) + 2000)

    const triggers = config.triggers || {}
    for (let keyword in triggers) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        await sock.sendMessage(sender, { text: triggers[keyword]}, { quoted: msg})
        return
}
}

    const templates = config.responseStyle?.template || []
    const reply = templates[Math.floor(Math.random() * templates.length)]
    if (config.autoReply && reply) {
      await sock.sendMessage(sender, { text: reply}, { quoted: msg})
} else {
      await sock.sendMessage(sender, { text: config.fallbackMessage}, { quoted: msg})
}
})
}

startBot()
