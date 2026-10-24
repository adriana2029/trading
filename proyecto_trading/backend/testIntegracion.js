// Prueba de extremo a extremo: levanta el servidor Express con una BD en memoria
// y recorre el flujo real por HTTP (registro -> login -> órdenes -> cartera).
process.env.DB_PATH = ':memory:';

const app = require('./server');
const { check, terminar } = require('./testHelper');

async function main() {

    const servidor = app.listen(0);
    const base = `http://localhost:${servidor.address().port}/api`;

    const http = async (metodo, ruta, cuerpo) => {
        const r = await fetch(base + ruta, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: cuerpo ? JSON.stringify(cuerpo) : undefined
        });
        return { status: r.status, data: await r.json() };
    };

    try {

        const reg = await http('POST', '/auth/register',
            { name: 'Ana', email: 'ana@mail.com', password: '123456' });
        check('Registro responde 201 con id numérico', reg.status === 201 && Number.isInteger(reg.data.user.id));

        const login = await http('POST', '/auth/login', { email: 'ana@mail.com', password: '123456' });
        const userId = login.data.user.id;
        check('Login correcto', login.status === 200 && userId === reg.data.user.id);

        const activos = await http('GET', '/orders/assets');
        check('El catálogo de activos (Flyweight) trae 6 activos', activos.data.length === 6);

        const cuenta0 = await http('GET', `/orders/account?userId=${userId}`);
        check('Saldo inicial simulado = 10000', cuenta0.data.saldo === 10000);

        const compra = await http('POST', '/orders',
            { userId, type: 'BUY', asset: 'ETH/USD', quantity: 1 });
        console.log('Respuesta compra:', compra.data.message, compra.data.result.status);
        check('POST /orders crea la orden (201) y queda FILLED',
            compra.status === 201 && compra.data.result.status === 'FILLED');

        const cartera = await http('GET', `/orders/portfolio?userId=${userId}`);
        check('GET /orders/portfolio devuelve el árbol Composite', cartera.data.tipo === 'grupo' && cartera.data.posiciones === 1);

        const hist = await http('GET', `/orders?userId=${userId}`);
        check('GET /orders devuelve el historial', hist.data.length === 1);

        const mala = await http('POST', '/orders', { userId, type: 'BUY', asset: 'ETH/USD', quantity: 9999 });
        check('Orden sin saldo responde 400', mala.status === 400);
        console.log('Mensaje:', mala.data.message);

        const sinUsuario = await http('POST', '/orders', { userId: 777, type: 'BUY', quantity: 1 });
        check('Usuario inexistente responde 400', sinUsuario.status === 400);

        const p1 = await http('GET', '/orders/price?asset=BTC/USD');
        const p2 = await http('GET', '/orders/price?asset=BTC/USD');
        check('Dos consultas seguidas de precio devuelven la misma cotización (caché del Proxy)',
            p1.data.timestamp === p2.data.timestamp);

    } finally {
        servidor.close();
    }

    terminar();
}

main().catch(e => { console.error(e); process.exit(1); });
