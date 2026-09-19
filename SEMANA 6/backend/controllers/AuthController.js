const AuthService = require('../services/AuthService');

class AuthController {

    constructor() {
        this.authService = new AuthService();
    }

    register = async (req, res) => {

        try {

            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    message: 'Todos los campos son obligatorios'
                });
            }

            const user = await this.authService.register(
                name,
                email,
                password
            );

            res.status(201).json({
                message: 'Usuario registrado correctamente',
                user: user
            });

        } catch (error) {

            res.status(400).json({
                message: error.message
            });

        }
    };

    login = async (req, res) => {

        try {

            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Correo y contraseña son obligatorios'
                });
            }

            const user = await this.authService.login(
                email,
                password
            );

            res.status(200).json({
                message: 'Login correcto',
                user: user
            });

        } catch (error) {

            res.status(401).json({
                message: error.message
            });

        }
    };
}

module.exports = AuthController;