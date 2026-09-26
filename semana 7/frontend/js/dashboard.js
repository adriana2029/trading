// OBTENER USUARIO

const user = JSON.parse(localStorage.getItem('user'));


// COMPROBAR SI EXISTE UN USUARIO

if (!user) {

    window.location.href = 'login.html';

} else {

    const welcome = document.getElementById('welcome');

    welcome.textContent = `Bienvenido, ${user.name}`;

}


// CERRAR SESIÓN

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', () => {

    localStorage.removeItem('user');

    window.location.href = 'login.html';

});


// OBTENER CAMPOS DE LA OPERACIÓN

const quantityInput = document.getElementById('quantity');

const priceInput = document.getElementById('price');

const stopLossInput = document.getElementById('stopLoss');

const takeProfitInput = document.getElementById('takeProfit');


// OBTENER BOTONES

const buyButton = document.getElementById('buyButton');

const sellButton = document.getElementById('sellButton');


// FUNCIÓN PARA CREAR UNA ORDEN

async function createOrder(type) {

    // Obtener valores del formulario

    const quantity = Number(quantityInput.value);

    const price = Number(priceInput.value);

    const stopLoss = Number(stopLossInput.value);

    const takeProfit = Number(takeProfitInput.value);


    // VALIDAR CANTIDAD

    if (!quantity || quantity <= 0) {

        alert('Introduce una cantidad válida.');

        return;

    }


    // VALIDAR PRECIO

    if (!price || price <= 0) {

        alert('Introduce un precio válido.');

        return;

    }


    // VALIDAR STOP LOSS

    if (!stopLoss || stopLoss <= 0) {

        alert('Introduce un Stop Loss válido.');

        return;

    }


    // VALIDAR TAKE PROFIT

    if (!takeProfit || takeProfit <= 0) {

        alert('Introduce un Take Profit válido.');

        return;

    }


    try {

        // ENVIAR ORDEN AL BACKEND

        const response = await fetch(
            'http://localhost:3000/api/orders',
            {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    type: type,

                    asset: 'BTC/USD',

                    quantity: quantity,

                    price: price,

                    stopLoss: stopLoss,

                    takeProfit: takeProfit,

                    user: user.name

                })

            }
        );


        // OBTENER RESPUESTA

        const data = await response.json();


        // COMPROBAR RESULTADO

        if (response.ok) {

            alert(
                `${data.message}\n\n` +

                `Usuario: ${data.order.user}\n` +

                `Activo: ${data.order.asset}\n` +

                `Tipo: ${data.order.type}\n` +

                `Cantidad: ${data.order.quantity}\n` +

                `Precio: $${data.order.price}\n` +

                `Stop Loss: $${data.order.stopLoss}\n` +

                `Take Profit: $${data.order.takeProfit}`
            );


            // MOSTRAR LA ORDEN EN LA CONSOLA

            console.log('Orden creada correctamente:', data.order);


        } else {

            alert(data.message);

        }


    } catch (error) {

        console.error('Error:', error);

        alert('No se pudo conectar con el servidor.');

    }

}


// BOTÓN COMPRAR

buyButton.addEventListener('click', () => {

    createOrder('BUY');

});


// BOTÓN VENDER

sellButton.addEventListener('click', () => {

    createOrder('SELL');

});