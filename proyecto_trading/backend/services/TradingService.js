// REAL SUBJECT
// Ejecuta de verdad la orden: la evalúa contra el mercado y actualiza
// saldo, cartera e historial dentro de UNA transacción.
// No valida permisos ni reglas de riesgo: eso lo hace TradingServiceProxy.

class TradingService {

    constructor(repository) {
        this.repo = repository;
    }

    // ctx = { userId, orderType, triggerPrice, market, orderId? }
    ejecutar(order, ctx) {

        const r = order.resolve(ctx.market);
        const ahora = new Date().toISOString();

        return this.repo.transaction(() => {

            const user = this.repo.getUser(ctx.userId);
            let balance = user.balance;

            if (r.status === 'FILLED') {

                const bruto = order.quantity * r.executionPrice;

                if (order.type === 'BUY') {

                    const total = bruto + r.fee;

                    if (balance < total) {
                        throw new Error(
                            `Saldo insuficiente: se necesitan ${total.toFixed(2)} y hay ${balance.toFixed(2)}`);
                    }

                    const previa = this.repo.getHolding(ctx.userId, order.asset);
                    const cantPrev = previa ? previa.quantity : 0;
                    const costoPrev = previa ? previa.quantity * previa.avg_price : 0;
                    const nuevaCant = cantPrev + order.quantity;

                    this.repo.saveHolding(ctx.userId, order.asset, nuevaCant,
                        (costoPrev + bruto) / nuevaCant);

                    balance -= total;

                } else {

                    const previa = this.repo.getHolding(ctx.userId, order.asset);

                    if (!previa || previa.quantity < order.quantity) {
                        throw new Error(`No tienes suficiente ${order.asset} para vender`);
                    }

                    const resto = previa.quantity - order.quantity;

                    if (resto < 1e-12) {
                        this.repo.deleteHolding(ctx.userId, order.asset);
                    } else {
                        this.repo.saveHolding(ctx.userId, order.asset, resto, previa.avg_price);
                    }

                    balance += bruto - r.fee;
                }

                this.repo.setBalance(ctx.userId, balance);
            }

            const datos = {
                status: r.status,
                executionPrice: r.executionPrice,
                fee: r.fee,
                notes: r.notes.join(' | '),
                executedAt: r.status === 'FILLED' ? ahora : null
            };

            let orderId = ctx.orderId;

            if (orderId) {
                this.repo.updateOrder(orderId, datos);
            } else {
                orderId = this.repo.insertOrder({
                    userId: ctx.userId,
                    asset: order.asset,
                    side: order.type,
                    orderType: ctx.orderType,
                    quantity: order.quantity,
                    price: ctx.triggerPrice ?? ctx.market,
                    stopLoss: r.protections.stopLoss || 0,
                    takeProfit: r.protections.takeProfit || 0,
                    createdAt: order.date,
                    ...datos
                });
            }

            return { orderId, ...datos, balance };
        });
    }
}

module.exports = TradingService;
