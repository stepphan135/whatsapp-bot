javascript
const fs = require('fs')
const { default: makeWASocket, useMultiFileAuthState} = require('@whiskeysockets/baileys')

const delay = ms => new Promise(res => setTimeout(res, ms))
let lastReplyTime = 0

function isActiveNow(start, end) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  return currentMinutes>= startMinutes && currentMinutes <= endMinutes
}

async function startBot() {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
  const { state, saveCreds} = await useMultiFileAuthState('./session')
  const sock = makeWASocket({ auth: state, printQRInTerminal: true})
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages}) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const sender = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    if (!text.trim()) return
    if (!isActiveNow(config.activeHours.start, config.activeHours.end)) return
    if (Date.now() - lastReplyTime < 5000) return
    lastReplyTime = Date.now()
