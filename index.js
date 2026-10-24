const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['AMD-BOT', 'Chrome', '1.0'],
        printQRInTerminal: false
    })
    sock.ev.on('creds.update', saveCreds)

    // Si pas encore connecté, demande un code de jumelage
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            const phoneNumber = '2290197619879' // <--- METS TON NUMERO ICI SANS +  ex: 22990000000
            try {
                const code = await sock.requestPairingCode(phoneNumber)
                console.log('=================================')
                console.log('TON CODE DE JUMELAGE: ' + code)
                console.log('Va sur WhatsApp > Appareils liés > Lier avec numéro de téléphone')
                console.log('=================================')
            } catch (e) {
                console.log('Erreur pairing:', e.message)
            }
        }, 3000)
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connexion fermée, reconnexion dans 3s')
            if (shouldReconnect) setTimeout(startBot, 3000)
        } else if (connection === 'open') {
            console.log('✅ BOT CONNECTÉ !!!!!')
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
