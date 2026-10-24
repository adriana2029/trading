// PROXY (caché + control de consumo)
// Mismo contrato que BinancePriceAdapter (obtenerPrecio(activo)), pero antes
// de llamar al proveedor externo revisa si ya tiene un precio reciente.
// Valorar una cartera de N posiciones o atender muchas órdenes seguidas ya no
// dispara N llamadas al proveedor (que en la vida real tiene límites de uso).

class PriceProviderProxy {

    // proveedor: objeto con obtenerPrecio(activo) (el Adapter)
    constructor(proveedor, { ttlMs = 5000, reloj = () => Date.now() } = {}) {
        this.proveedor = proveedor;   // RealSubject
        this.ttlMs = ttlMs;
        this.reloj = reloj;
        this.cache = new Map();
        this.stats = { aciertos: 0, fallos: 0 };
    }

    obtenerPrecio(activo) {

        const ahora = this.reloj();
        const guardado = this.cache.get(activo);

        if (guardado && ahora - guardado.guardadoEn < this.ttlMs) {
            this.stats.aciertos++;
            return guardado.cotizacion;
        }

        this.stats.fallos++;

        const cotizacion = this.proveedor.obtenerPrecio(activo);
        this.cache.set(activo, { cotizacion, guardadoEn: ahora });

        return cotizacion;
    }

    invalidar() {
        this.cache.clear();
    }
}

module.exports = PriceProviderProxy;
