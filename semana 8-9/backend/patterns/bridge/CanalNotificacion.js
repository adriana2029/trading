// IMPLEMENTOR
// Define la interfaz de bajo nivel que todo canal de envío debe cumplir.
// A diferencia del Adapter, aquí el canal se diseña desde el inicio para
// combinarse con la abstracción (Notificacion); no existía antes con otra interfaz.

class CanalNotificacion {

    enviar(destinatario, asunto, mensaje) {
        throw new Error('enviar() debe implementarse en el canal concreto');
    }
}

module.exports = CanalNotificacion;
