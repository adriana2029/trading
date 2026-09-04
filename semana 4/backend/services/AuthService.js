const bcrypt = require('bcrypt');
const User = require('../models/User');

class AuthService {

    constructor() {
        this.userModel = new User();
    }

    async register(name, email, password) {

        const existingUser = this.userModel.findByEmail(email);

        if (existingUser) {
            throw new Error('El correo ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = this.userModel.create(
            name,
            email,
            hashedPassword
        );

        return {
            id: userId,
            name: name,
            email: email
        };
    }

    async login(email, password) {

        const user = this.userModel.findByEmail(email);

        if (!user) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }
}

module.exports = AuthService;