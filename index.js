const fs = require('fs')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

if (fs.existsSync('./auth')) {
  fs.rmSync('./auth', { recursive: true, force: true })
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['AMD-BOT', 'Chrome', '1.0'],
        printQRInTerminal: false
    })
    sock.ev.on('creds.update', saveCreds)

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode('2290197619879')
                console.log('============================')
                console.log('TON CODE: ' + code)
                console.log('============================')
            } catch (e) {
                console.log('Erreur pairing: ' + e.message)
            }
        }, 4000)
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connexion fermee, reconnexion dans 3s')
            if (shouldReconnect) setTimeout(startBot, 3000)
        } else if (connection === 'open') {
            console.log('✅ BOT CONNECTE !!!!!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return
        const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
        if (text.toLowerCase() === 'ping') {
            await sock.sendMessage(m.key.remoteJid, { text: 'Pong! AMD-BOT en direct ✅' })
        }
    })
}
startBot()
