const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const P = require('pino')

async function start() {
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['Chrome','Chrome','1.0'],
        printQRInTerminal: false
    })
    sock.ev.on('creds.update', saveCreds)

    // Attendre que le socket soit prêt
    await new Promise(r => setTimeout(r, 3000))

    if (!sock.authState.creds.registered) {
        try {
            const code = await sock.requestPairingCode('2290197619879')
            console.log('========================')
            console.log('CODE: ' + code)
            console.log('========================')
        } catch(e) {
            console.log('Erreur pairing, on reessaie:', e.message)
        }
    }

    sock.ev.on('connection.update', async (u) => {
        if (u.connection === 'open') console.log('CONNECTED')
    })
}
start()
