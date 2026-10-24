const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')

async function start() {
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['Ubuntu','Chrome','20.0.04']
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (u) => {
        const { qr, connection } = u
        if (qr) {
            console.log('SCAN QR BELOW')
            qrcode.generate(qr, { small: true })
        }
        if (connection === 'open') console.log('CONNECTED_SUCCESS')
    })
    // garder en vie
    setInterval(()=>{}, 10000)
}
start()
