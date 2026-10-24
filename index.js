const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    })

    sock.ev.on('creds.update', saveCreds)
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('✅ AMD-BOT Connecté !')
        }
    })

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0]
        if(!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const from = msg.key.remoteJid
        
        if(text.toLowerCase() === 'salut' || text.toLowerCase() === 'bonjour') {
            await sock.sendMessage(from, { text: 'Salut ! Moi c’est AMD-BOT 🤖 Créé par WILLYDEM. Tape *menu* pour voir ce que je fais.' })
        }
        if(text.toLowerCase() === 'menu') {
            await sock.sendMessage(from, { text: `*AMD-BOT MENU*\n\n1. salut - je te salue\n2. vawulance - info sur ton projet\n3. ping - je réponds pong` })
        }
        if(text.toLowerCase() === 'ping') {
            await sock.sendMessage(from, { text: 'Pong 🏓' })
        }
    })
}
startBot()
