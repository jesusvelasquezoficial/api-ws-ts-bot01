import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot'
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys'
import 'dotenv/config'

// Base de datos en memoria para almacenar estados temporales
const db = new MemoryDB()

// Flujos del chatbot
const flowBienvenida = addKeyword('hola')
  .addAnswer('Hola, buen día! Escribe "menu" para ver las opciones disponibles.')

const flowMenu = addKeyword('menu')
  .addAnswer('Estas son las opciones disponibles:')
  .addAnswer('1. Identificación')
  .addAnswer('2. Requerimientos')
  .addAnswer('3. Reporte de pagos')
  .addAnswer('4. Deuda del propietario')
  .addAnswer('5. Recibo de condominio')
  .addAnswer('6. Actividades en curso')
  .addAnswer('7. Reporte de gastos')
  .addAnswer('8. Reporte de cobros')
  .addAnswer('9. Agregar factura a proveedores')
  .addAnswer('10. Recibos pendientes')
  .addAnswer('11. Recibos pagados')
  .addAnswer('Por favor, responde con el número de la opción que deseas seleccionar.')
  
const flowIdentificacion = addKeyword('1')
  .addAnswer('Por favor, proporciona tu conjunto-apto/casa-ciudad para proceder con la identificación.', { capture: true }, async (ctx, { flowDynamic, endFlow  }) => {
    // Almacenar el conjunto-apto/casa-ciudad proporcionado por el usuario
    const userPhone = ctx.from
    const userResponse = ctx.body
    console.log(ctx) // Puedes usar esto para depuración

    // db.set(userPhone, { identificacion: userResponse })
    
    // Aquí, puedes agregar lógica para verificar la identificación del usuario
    const isValidUser = await verificarIdentificacion(userResponse)
    if (isValidUser) {
        return endFlow('Identificación verificada con éxito.')
    } else {
        return endFlow('No se pudo verificar tu identificación. Por favor, intenta de nuevo.')
    }
  })

// Función para verificar la identificación del usuario
const verificarIdentificacion = async (identificacion) => {
  // Aquí puedes agregar la lógica para verificar la identificación del usuario
  // Por ejemplo, consultando una base de datos o un servicio externo
  const listaIdentificacionesValidas = [
    'conjunto-apto1/casa1-ciudad1',
    'conjunto-apto2/casa2-ciudad2'
  ]

  return listaIdentificacionesValidas.includes(identificacion)
}

const flowRequerimientos = addKeyword('2')
  .addAnswer('Por favor, dime cuál es tu requerimiento para que podamos procesarlo.')

const flowReportePagos = addKeyword('3')
  .addAnswer('Por favor, envíame los detalles de tu pago (monto, fecha, referencia) para registrarlo.')

const flowDeudaPropietario = addKeyword('4')
  .addAnswer('Voy a verificar tu saldo pendiente. Por favor, espera un momento...')

const flowReciboCondominio = addKeyword('5')
  .addAnswer('Estoy generando tu recibo de condominio. Por favor, espera un momento...')

const flowActividadesCurso = addKeyword('6')
  .addAnswer('Estas son las actividades o requerimientos que tenemos en curso actualmente: ...')

const flowReportesGastos = addKeyword('7')
  .addAnswer('Aquí tienes el reporte de gastos: ...')

const flowReportesCobros = addKeyword('8')
  .addAnswer('Aquí tienes el reporte de cobros: ...')

const flowAgregarFacturaProveedores = addKeyword('9')
  .addAnswer('Por favor, proporciona los detalles de la factura para proceder.')

const flowRecibosPendientes = addKeyword('10')
  .addAnswer('Aquí tienes los recibos pendientes: ...')

const flowRecibosPagados = addKeyword('11')
  .addAnswer('Aquí tienes los recibos pagados: ...')

// Creación del bot
const main = async () =>{ 
    const provider = createProvider(BaileysProvider)
    const CLIENT_NUMBER = process.env.CLIENT_NUMBER || ''
    provider.initHttpServer(3002)
    provider.http?.server.get('/send-msg', handleCtx(async (bot, req, res) => {
        await bot.sendMessage(CLIENT_NUMBER, 'Este mensaje de WhatsApp viene desde API del servidor privado de Yisus.', {})
        res.end('esto es del server de polka')
    }))
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
        flow: createFlow([
            flowBienvenida,
            flowMenu,
            flowIdentificacion,
            flowRequerimientos,
            flowReportePagos,
            flowDeudaPropietario,
            flowReciboCondominio,
            flowActividadesCurso,
            flowReportesGastos,
            flowReportesCobros,
            flowAgregarFacturaProveedores,
            flowRecibosPendientes,
            flowRecibosPagados
        ]),
        database: db,
        provider
    })
}

main()