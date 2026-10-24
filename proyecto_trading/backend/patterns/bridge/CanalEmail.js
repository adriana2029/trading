const CanalNotificacion = require('./CanalNotificacion');

// CONCRETE IMPLEMENTOR
// En un proyecto real aquí iría la integración con un servidor SMTP o un
// servicio como SendGrid. Se deja simulado (console.log) para no requerir
// credenciales ni acceso de red dentro del simulador.

class CanalEmail extends CanalNotificacion {

    enviar(destinatario, asunto, mensaje) {

        console.log(`[EMAIL] Para: ${destinatario} | Asunto: ${asunto}`);
        console.log(`[EMAIL] Mensaje: ${mensaje}`);
    }
}

module.exports = CanalEmail;
