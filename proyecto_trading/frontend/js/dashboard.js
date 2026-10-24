// OBTENER USUARIO

const user = JSON.parse(localStorage.getItem('user'));

const API = 'http://localhost:3000/api/orders';


// COMPROBAR SI EXISTE UN USUARIO

if (!user) {

    window.location.href = 'login.html';

} else {

    document.getElementById('welcome').textContent = `Bienvenido, ${user.name}`;

}


// CERRAR SESIÓN

document.getElementById('logoutButton').addEventListener('click', () => {

    localStorage.removeItem('user');

    window.location.href = 'login.html';

});


// ELEMENTOS

const assetSelect = document.getElementById('asset');

const orderTypeSelect = document.getElementById('orderType');

const quantityInput = document.getElementById('quantity');

const priceInput = document.getElementById('price');

const stopLossInput = document.getElementById('stopLoss');

const takeProfitInput = document.getElementById('takeProfit');

const priceBox = document.getElementById('priceBox');

const priceLabel = document.getElementById('priceLabel');

const marketPrice = document.getElementById('marketPrice');


const money = (n) => '$' + Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
});


// MOSTRAR / OCULTAR EL CAMPO DE PRECIO SEGÚN EL TIPO DE ORDEN

orderTypeSelect.addEventListener('change', () => {

    const tipo = orderTypeSelect.value;

    priceBox.style.display = tipo === 'MARKET' ? 'none' : 'block';

    priceLabel.textContent = tipo === 'LIMIT' ? 'Precio límite' : 'Precio stop';

});


// LLAMADA GENÉRICA A LA API

async function api(path, options) {

    const response = await fetch(`${API}${path}`, options);

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Error');

    return data;

}


// CARGAR CATÁLOGO DE ACTIVOS

async function loadAssets() {

    const assets = await api('/assets');

    assetSelect.innerHTML = assets.map(a =>
        `<option value="${a.symbol}">${a.name} (${a.symbol}) - ${a.category}</option>`
    ).join('');

    await loadPrice();

}


// PRECIO DE MERCADO DEL ACTIVO SELECCIONADO

async function loadPrice() {

    try {

        const p = await api(`/price?asset=${encodeURIComponent(assetSelect.value)}`);

        marketPrice.textContent = `${assetSelect.value}: ${money(p.precio)}`;

    } catch (error) {

        marketPrice.textContent = 'Precio no disponible';

    }

}

assetSelect.addEventListener('change', loadPrice);


// SALDO, CARTERA E HISTORIAL

async function refresh() {

    try {

        // Primero se reintentan las órdenes límite/stop pendientes

        await api('/pending/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });

        const [cuenta, cartera, historial] = await Promise.all([
            api(`/account?userId=${user.id}`),
            api(`/portfolio?userId=${user.id}`),
            api(`/?userId=${user.id}`)
        ]);

        document.getElementById('balance').textContent = money(cuenta.saldo);

        document.getElementById('equity').textContent =
            `${money(cuenta.valorCartera)} / ${money(cuenta.patrimonio)}`;

        renderPortfolio(cartera);

        renderHistory(historial);

        loadPrice();

    } catch (error) {

        console.error('Error:', error);

    }

}


function renderPortfolio(cartera) {

    const body = document.getElementById('portfolioTable');

    const filas = [];

    for (const grupo of cartera.hijos) {

        filas.push(`<tr><td colspan="6"><strong>${grupo.nombre}</strong> - ${money(grupo.valor)}</td></tr>`);

        for (const p of grupo.hijos) {

            const clase = p.ganancia >= 0 ? 'gain-pos' : 'gain-neg';

            filas.push(`<tr>
                <td>${p.nombre}</td>
                <td>${p.cantidadFormateada}</td>
                <td>${money(p.precioPromedio)}</td>
                <td>${money(p.precioActual)}</td>
                <td>${money(p.valor)}</td>
                <td class="${clase}">${money(p.ganancia)}</td>
            </tr>`);

        }

    }

    body.innerHTML = filas.length
        ? filas.join('')
        : '<tr><td colspan="6">No tienes activos todavía</td></tr>';

}


function renderHistory(historial) {

    const body = document.getElementById('operationsTable');

    body.innerHTML = historial.length
        ? historial.map(o => `<tr>
            <td>${o.activo}</td>
            <td>${o.tipo}</td>
            <td>${o.ejecucion}</td>
            <td>${o.cantidad}</td>
            <td>${money(o.precioEjecucion ?? o.precio)}</td>
            <td>${money(o.comision)}</td>
            <td class="status-${o.estado}" title="${o.notas || ''}">${o.estado}</td>
        </tr>`).join('')
        : '<tr><td colspan="7">No hay operaciones todavía</td></tr>';

}


// FUNCIÓN PARA CREAR UNA ORDEN

async function createOrder(type) {

    const quantity = Number(quantityInput.value);

    const orderType = orderTypeSelect.value;

    const price = Number(priceInput.value);


    if (!quantity || quantity <= 0) {

        alert('Introduce una cantidad válida.');

        return;

    }

    if (orderType !== 'MARKET' && (!price || price <= 0)) {

        alert('Introduce el precio límite / stop.');

        return;

    }


    try {

        const data = await api('', {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                userId: user.id,

                type: type,

                asset: assetSelect.value,

                orderType: orderType,

                quantity: quantity,

                price: orderType === 'MARKET' ? undefined : price,

                stopLoss: Number(stopLossInput.value) || 0,

                takeProfit: Number(takeProfitInput.value) || 0

            })

        });

        const r = data.result;

        alert(
            `${data.message}\n\n` +

            `Estado: ${r.status}\n` +

            `Precio de mercado: ${money(data.market)}\n` +

            (r.executionPrice ? `Precio de ejecución: ${money(r.executionPrice)}\n` : '') +

            `Comisión: ${money(r.fee)}\n` +

            (r.notes ? `Detalle: ${r.notes}` : '')
        );

        refresh();

    } catch (error) {

        alert(error.message === 'Failed to fetch'
            ? 'No se pudo conectar con el servidor.'
            : error.message);

    }

}


// BOTONES

document.getElementById('buyButton').addEventListener('click', () => createOrder('BUY'));

document.getElementById('sellButton').addEventListener('click', () => createOrder('SELL'));


// INICIO + ACTUALIZACIÓN PERIÓDICA (para que las órdenes pendientes se ejecuten)

if (user) {

    loadAssets().then(refresh);

    setInterval(refresh, 15000);

}
