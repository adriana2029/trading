const CanalNotificacion = require('./CanalNotificacion');

// CONCRETE IMPLEMENTOR
// Simulación de notificación push (ej. Firebase Cloud Messaging).

class CanalPush extends CanalNotificacion {

    enviar(destinatario, asunto, mensaje) {

        console.log(`[PUSH] Usuario: ${destinatario} | ${asunto}: ${mensaje}`);
    }
}

module.exports = CanalPush;
