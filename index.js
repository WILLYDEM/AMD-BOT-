const fs = require('fs')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const P = require('pino')

// Supprime l'ancienne session corrompue au démarrage
if (fs.existsSync('./auth')) {
    fs.rmSync('./auth', { recursive: true, force: true })
    console.log('Dossier auth nettoyé, génération d un nouveau QR...')
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['AMD-BOT', 'Chrome', '1.0']
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
            console.log('--- SCANNE CE QR CODE ---')
            qrcode.generate(qr, { small: true })
            console.log(qr)
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connexion fermée')
            if (shouldReconnect) {
                setTimeout(startBot, 3000)
            }
        } else if (connection === 'open') {
            console.log('✅ BOT CONNECTÉ !')
        }
    })
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return
        const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
        if (text.toLowerCase() === 'ping') {
            await sock.sendMessage(m.key.remoteJid, { text: 'Pong! AMD-BOT ✅' })
        }
    })
}
startBot()
