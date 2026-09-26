// ABSTRACTION
// Mantiene una referencia al canal (el "puente") y delega en él el envío.
// Nuevos tipos de notificación NO necesitan saber nada sobre canales,
// y nuevos canales NO necesitan saber nada sobre tipos de notificación.

class Notificacion {

    constructor(canal) {
        this.canal = canal; // el puente hacia CanalNotificacion
    }

    notificar(usuario, datos) {
        throw new Error('notificar() debe implementarse en la subclase');
    }
}

module.exports = Notificacion;
