process.env.DB_PATH = ':memory:';

const PriceProviderProxy = require('./patterns/proxy/PriceProviderProxy');
const TradingServiceProxy = require('./patterns/proxy/TradingServiceProxy');
const TradingService = require('./services/TradingService');
const TradingRepository = require('./models/TradingRepository');
const BuyOrder = require('./patterns/BuyOrder');
const SellOrder = require('./patterns/SellOrder');
const { check, terminar } = require('./testHelper');
require('./database/database');

// ---------- Proxy 1: caché de precios ----------
let llamadas = 0;
const proveedorReal = { obtenerPrecio: (a) => { llamadas++; return { activo: a, precio: 100 + llamadas }; } };
let reloj = 0;
const proxy = new PriceProviderProxy(proveedorReal, { ttlMs: 5000, reloj: () => reloj });

const p1 = proxy.obtenerPrecio('BTC/USD');
const p2 = proxy.obtenerPrecio('BTC/USD');
console.log('Llamadas al proveedor tras 2 consultas seguidas:', llamadas);
check('La segunda consulta sale de la caché (1 sola llamada real)', llamadas === 1 && p1 === p2);

reloj = 6000; // pasan 6 s: el dato expiró
proxy.obtenerPrecio('BTC/USD');
check('Al expirar el TTL se vuelve a consultar al proveedor', llamadas === 2);
console.log('Estadísticas de la caché:', proxy.stats);

// ---------- Proxy 2: protección de órdenes ----------
const repo = new TradingRepository();
const { lastInsertRowid } = repo.db
    .prepare("INSERT INTO users (name,email,password) VALUES ('Ana','ana@mail.com','x')").run();
const userId = Number(lastInsertRowid);

const logs = [];
const servicio = new TradingServiceProxy(new TradingService(repo), repo, { logger: m => logs.push(m) });

const compra = new BuyOrder({ user: 'Ana', asset: 'BTC/USD', quantity: 0.1, price: 60000 });
const ctx = { userId, orderType: 'MARKET', market: 60000 };

const ok = servicio.ejecutar(compra, ctx);
console.log('Compra permitida:', ok);
check('Compra válida pasa el proxy y se ejecuta', ok.status === 'FILLED');
check('El saldo bajó 6000 (10000 -> 4000)', repo.getUser(userId).balance === 4000);

const cara = new BuyOrder({ user: 'Ana', asset: 'BTC/USD', quantity: 1, price: 60000 });
try { servicio.ejecutar(cara, ctx); } catch (e) { console.log('Bloqueada:', e.message); }
check('Compra sin saldo es bloqueada ANTES de llegar al servicio real', repo.getUser(userId).balance === 4000);

try { servicio.ejecutar(new SellOrder({ asset: 'ETH/USD', quantity: 1 }), { ...ctx, market: 3000 }); }
catch (e) { console.log('Bloqueada:', e.message); check('Venta de un activo que no tiene es bloqueada', true); }

try { servicio.ejecutar(compra, { ...ctx, userId: 999 }); }
catch (e) { console.log('Bloqueada:', e.message); check('Usuario inexistente es bloqueado', true); }

check('El proxy dejó bitácora de auditoría (1 OK + 3 rechazos)', servicio.bitacora.length === 4);
console.log('Bitácora:', servicio.bitacora.map(b => `${b.resultado}: ${b.detalle}`));

terminar();
