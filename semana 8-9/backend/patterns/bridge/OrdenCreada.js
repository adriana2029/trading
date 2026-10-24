const Notificacion = require('./Notificacion');

// REFINED ABSTRACTION
// Se combina con cualquier CanalNotificacion (Email, Push, SMS...)
// sin que exista una clase "OrdenCreadaEmail" u "OrdenCreadaPush".

class OrdenCreada extends Notificacion {

    notificar(usuario, orden) {

        const asunto = 'Orden registrada';

        const mensaje = `Tu orden de ${orden.type} de ${orden.quantity} ` +
            `${orden.asset} a ${orden.price} fue creada correctamente.`;

        this.canal.enviar(usuario, asunto, mensaje);
    }
}

module.exports = OrdenCreada;
