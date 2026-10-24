const OrderBuilder = require('../OrderBuilder');
const OrderFactory = require('../OrderFactory');
const BinancePriceAdapter = require('../adapter/BinancePriceAdapter');
const PriceProviderProxy = require('../proxy/PriceProviderProxy');
const TradingServiceProxy = require('../proxy/TradingServiceProxy');
const TradingService = require('../../services/TradingService');
const TradingRepository = require('../../models/TradingRepository');
const AssetFlyweightFactory = require('../flyweight/AssetFlyweightFactory');
const PortfolioGroup = require('../composite/PortfolioGroup');
const Position = require('../composite/Position');
const LimitOrderDecorator = require('../decorator/LimitOrderDecorator');
const StopLossDecorator = require('../decorator/StopLossDecorator');
const ProteccionDecorator = require('../decorator/ProteccionDecorator');
const CommissionDecorator = require('../decorator/CommissionDecorator');
const OrdenCreada = require('../bridge/OrdenCreada');
const CanalEmail = require('../bridge/CanalEmail');

const TIPOS_ORDEN = ['MARKET', 'LIMIT', 'STOP_LOSS'];
const NOMBRE_CATEGORIA = { CRYPTO: 'Criptomonedas', TOKEN: 'Tokens', NFT: 'NFT' };

// FACADE
// Punto único de entrada al subsistema de trading. El controlador solo conoce
// estos métodos y no necesita saber que por debajo trabajan: Flyweight (activos),
// Proxy (precios y reglas de riesgo), Adapter (Binance), Builder, Factory Method,
// Decorator (tipos de orden), Composite (cartera), Singleton (BD) y Bridge (avisos).

class TradingFacade {

    constructor({ priceProvider, tradingService, repository, notificador, comision = 0.001 } = {}) {

        this.repo = repository || new TradingRepository();

        // Proxy de caché sobre el Adapter de Binance
        this.precios = priceProvider || new PriceProviderProxy(new BinancePriceAdapter());

        // Proxy de protección sobre el servicio real
        this.servicio = tradingService ||
            new TradingServiceProxy(new TradingService(this.repo), this.repo);

        // Bridge: tipo de notificación + canal
        this.notificar = notificador ||
            ((destino, resumen) => new OrdenCreada(new CanalEmail()).notificar(destino, resumen));

        this.comision = comision;
    }

    // ------------------------------------------------------------------
    // Crear una orden (MARKET, LIMIT o STOP_LOSS)
    // ------------------------------------------------------------------
    crearOrden(dto) {

        const { userId, type, asset, quantity, price, stopLoss, takeProfit } = dto;
        const orderType = dto.orderType || 'MARKET';

        if (!type) throw new Error('El tipo de orden es obligatorio');
        if (!TIPOS_ORDEN.includes(orderType)) throw new Error('Tipo de ejecución no válido');

        const user = this.repo.getUser(userId);
        if (!user) throw new Error('Usuario no autorizado: no existe');

        const activo = AssetFlyweightFactory.get(asset || 'BTC/USD');      // Flyweight
        const mercado = this.precios.obtenerPrecio(activo.symbol).precio; // Proxy -> Adapter

        const trigger = orderType === 'MARKET' ? null : Number(price);

        if (orderType !== 'MARKET' && !(trigger > 0)) {
            throw new Error('Debes indicar el precio límite / stop de la orden');
        }

        const order = this._ensamblar({
            side: type, asset: activo.symbol, quantity: Number(quantity),
            orderType, trigger, stopLoss, takeProfit, user: user.name
        }, mercado, true);

        const resultado = this.servicio.ejecutar(order, {
            userId, orderType, triggerPrice: trigger, market: mercado
        });

        // Bridge: aviso al usuario
        this.notificar(user.email, {
            type, quantity: order.quantity, asset: activo.symbol,
            price: resultado.executionPrice ?? trigger ?? mercado
        });

        return {
            message: `${order.execute()} - ${resultado.status === 'FILLED' ? 'EJECUTADA' : 'PENDIENTE'}`,
            order,
            resultado,
            mercado
        };
    }

    // Builder + Factory Method + Decorators
    _ensamblar(d, mercado, validar) {

        const esCompra = d.side === 'BUY';
        const conNiveles = esCompra && d.orderType !== 'STOP_LOSS';

        const datos = new OrderBuilder()
            .setUser(d.user || null)
            .setAsset(d.asset)
            .setType(d.side)
            .setQuantity(d.quantity)
            .setPrice(d.trigger || mercado)
            .setStopLoss(conNiveles ? (d.stopLoss || 0) : 0)
            .setTakeProfit(conNiveles ? (d.takeProfit || 0) : 0)
            .build();

        let order = OrderFactory.createOrder(d.side, datos);

        if (d.orderType === 'LIMIT') {
            order = new LimitOrderDecorator(order, d.trigger);
        }

        if (d.orderType === 'STOP_LOSS') {
            order = new StopLossDecorator(order, d.trigger);
            if (validar) order.validarContra(mercado);
        }

        if (conNiveles && (d.stopLoss || d.takeProfit)) {
            order = new ProteccionDecorator(order, {
                stopLoss: d.stopLoss, takeProfit: d.takeProfit,
                referencia: d.trigger || mercado
            });
        }

        return new CommissionDecorator(order, this.comision);
    }

    // ------------------------------------------------------------------
    // Reintenta las órdenes límite/stop que están pendientes
    // ------------------------------------------------------------------
    procesarPendientes(userId) {

        const cambios = [];

        for (const fila of this.repo.getPendingOrders(userId)) {

            const mercado = this.precios.obtenerPrecio(fila.asset).precio;

            try {

                const order = this._ensamblar({
                    side: fila.side, asset: fila.asset, quantity: fila.quantity,
                    orderType: fila.order_type, trigger: fila.price,
                    stopLoss: fila.stop_loss, takeProfit: fila.take_profit
                }, mercado, false);

                const r = this.servicio.ejecutar(order, {
                    userId, orderId: fila.id, orderType: fila.order_type,
                    triggerPrice: fila.price, market: mercado
                });

                if (r.status === 'FILLED') cambios.push({ id: fila.id, estado: 'FILLED' });

            } catch (error) {

                this.repo.updateOrder(fila.id, {
                    status: 'REJECTED', executionPrice: null, fee: 0,
                    notes: error.message, executedAt: null
                });

                cambios.push({ id: fila.id, estado: 'REJECTED', motivo: error.message });
            }
        }

        return cambios;
    }

    // ------------------------------------------------------------------
    // Consultas
    // ------------------------------------------------------------------
    obtenerCuenta(userId) {

        const user = this.repo.getUser(userId);
        if (!user) throw new Error('Usuario no encontrado');

        const cartera = this.obtenerCartera(userId);

        return {
            usuario: user.name,
            saldo: Number(user.balance.toFixed(2)),
            valorCartera: cartera.valor,
            patrimonio: Number((user.balance + cartera.valor).toFixed(2))
        };
    }

    // Composite: Cartera -> Categoría -> Posición (con Flyweight por activo)
    obtenerCartera(userId) {

        const raiz = new PortfolioGroup('Mi cartera');
        const grupos = {};

        for (const h of this.repo.getHoldings(userId)) {

            const activo = AssetFlyweightFactory.get(h.asset);

            if (!grupos[activo.category]) {
                grupos[activo.category] = new PortfolioGroup(NOMBRE_CATEGORIA[activo.category]);
                raiz.add(grupos[activo.category]);
            }

            grupos[activo.category].add(new Position(activo, h.quantity, h.avg_price));
        }

        return raiz.toTree(this.precios);
    }

    obtenerHistorial(userId) {
        return this.repo.getOrders(userId).map(o => ({
            id: o.id, activo: o.asset, tipo: o.side, ejecucion: o.order_type,
            cantidad: o.quantity, precio: o.price, precioEjecucion: o.execution_price,
            comision: o.fee, estado: o.status, notas: o.notes, fecha: o.created_at
        }));
    }

    obtenerPrecio(asset) {
        const activo = AssetFlyweightFactory.get(asset);
        return this.precios.obtenerPrecio(activo.symbol);
    }

    listarActivos() {
        return AssetFlyweightFactory.list().map(a => ({
            symbol: a.symbol, name: a.name, category: a.category, decimals: a.decimals
        }));
    }
}

module.exports = TradingFacade;
