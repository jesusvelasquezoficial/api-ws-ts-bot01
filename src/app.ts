import { createBot,createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot'
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys'
import 'dotenv/config'

const flowBienvenida = addKeyword('hola').addAnswer('hola, buen dia!!')

const main = async () =>{ 
    const provider = createProvider(BaileysProvider)
    const CLIENT_NUMBER = process.env.CLIENT_NUMBER || ''
    provider.initHttpServer(3002)
    provider.http?.server.get('/send-message', handleCtx(async (bot, req, res) => {
        const body = req.body
        const phone = body.phone
        const msg = body.message
        const mediaURL = body.mediaURL
        console.log(body);
        await bot.sendMessage(CLIENT_NUMBER, msg, {
            media: mediaURL
        })
        res.end('esto es del server de polka')
    }))

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider
    })
}


main()