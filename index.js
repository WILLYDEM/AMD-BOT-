const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const P = require('pino')

async function start() {
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['Chrome','Chrome','1.0']
    })
    sock.ev.on('creds.update', saveCreds)
    
    await new Promise(r => setTimeout(r, 8000))
    
    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode('2290197619879')
        console.log('PAIRING_CODE:' + code)
    }
    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') console.log('CONNECTED_SUCCESS')
    })
}
start()
