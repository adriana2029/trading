const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {

        const response = await fetch(
            'http://localhost:3000/api/auth/login',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

    if (response.ok) {

    localStorage.setItem(
        'user',
        JSON.stringify(data.user)
    );

    window.location.href = 'dashboard.html';

} else {

    message.textContent = data.message;

}

    } catch (error) {

        message.textContent =
            'No se pudo conectar con el servidor';

        console.error(error);
    }
});