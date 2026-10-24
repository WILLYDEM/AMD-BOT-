console.log('START 1')
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')
console.log('START 2')

async function start() {
    console.log('START 3 - fetching auth')
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    console.log('START 4 - creating socket')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['Ubuntu','Chrome','20.0.04']
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', async (u) => {
        console.log('UPDATE', JSON.stringify(u))
        if (u.qr) {
            const qrcode = require('qrcode-terminal')
            qrcode.generate(u.qr, { small: true })
            console.log('QR_CODE:'+u.qr)
        }
        if (u.connection === 'open') console.log('CONNECTED')
    })
}
start()
setInterval(()=>{}, 10000)
