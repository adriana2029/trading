// PROXY (protección + auditoría)
// Mismo contrato que TradingService (ejecutar(order, ctx)). Antes de dejar
// pasar la llamada comprueba las reglas de riesgo del simulador y registra
// una bitácora. Si algo no se cumple, el servicio real ni se entera.

class TradingServiceProxy {

    constructor(servicioReal, repository, { logger = null } = {}) {
        this.servicio = servicioReal;     // RealSubject
        this.repo = repository;
        this.logger = logger;
        this.bitacora = [];
    }

    ejecutar(order, ctx) {

        try {

            this._validar(order, ctx);

            const resultado = this.servicio.ejecutar(order, ctx);

            this._registrar('OK', order, ctx, resultado.status);

            return resultado;

        } catch (error) {

            this._registrar('RECHAZADA', order, ctx, error.message);

            throw error;
        }
    }

    _validar(order, ctx) {

        const user = this.repo.getUser(ctx.userId);

        if (!user) {
            throw new Error('Usuario no autorizado: no existe');
        }

        if (!Number.isFinite(order.quantity) || order.quantity <= 0) {
            throw new Error('La cantidad debe ser mayor que 0');
        }

        // Solo se pre-valida al CREAR (las pendientes se revalidan al ejecutarse)
        if (ctx.orderId) return;

        if (order.type === 'BUY') {

            const estimado = order.quantity * (ctx.triggerPrice ?? ctx.market);

            if (user.balance < estimado) {
                throw new Error(
                    `Saldo insuficiente: la orden vale ${estimado.toFixed(2)} y tu saldo es ${user.balance.toFixed(2)}`);
            }

        } else {

            const posicion = this.repo.getHolding(ctx.userId, order.asset);

            if (!posicion || posicion.quantity < order.quantity) {
                throw new Error(`No tienes suficiente ${order.asset} para vender`);
            }
        }
    }

    _registrar(resultado, order, ctx, detalle) {

        const entrada = {
            fecha: new Date().toISOString(),
            usuario: ctx.userId,
            operacion: `${order.type} ${order.quantity} ${order.asset}`,
            resultado,
            detalle
        };

        this.bitacora.push(entrada);

        if (this.logger) this.logger(`[AUDITORIA] ${JSON.stringify(entrada)}`);
    }
}

module.exports = TradingServiceProxy;
