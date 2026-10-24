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
    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode('2290197619879')
        console.log('CODE:' + code)
    }
    sock.ev.on('connection.update', async (u) => {
        if (u.connection === 'open') {
            console.log('CONNECTED')
        }
    })
}
start()
