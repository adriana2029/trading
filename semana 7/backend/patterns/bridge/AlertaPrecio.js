const Notificacion = require('./Notificacion');

// REFINED ABSTRACTION
// Otro "tipo" de notificación, independiente del canal usado.
// Agregar este tipo no obligó a tocar CanalEmail ni CanalPush.

class AlertaPrecio extends Notificacion {

    notificar(usuario, { activo, precio, umbral }) {

        const asunto = `Alerta de precio: ${activo}`;

        const mensaje = `${activo} alcanzó ${precio}, ` +
            `tu umbral configurado era ${umbral}.`;

        this.canal.enviar(usuario, asunto, mensaje);
    }
}

module.exports = AlertaPrecio;
