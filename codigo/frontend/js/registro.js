const registroForm = document.getElementById('registroForm');
const message = document.getElementById('message');

registroForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {

        const response = await fetch(
            'http://localhost:3000/api/auth/register',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            message.textContent = data.message;

            registroForm.reset();

        } else {

            message.textContent = data.message;

        }

    } catch (error) {

        message.textContent =
            'No se pudo conectar con el servidor';

        console.error(error);
    }
});