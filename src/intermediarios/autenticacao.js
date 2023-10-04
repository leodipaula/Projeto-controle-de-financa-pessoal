const jwt = require('jsonwebtoken');
const senhaSegura = require('../chavesecreta');

const verificarLogin = (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(400).json({
                mensagem: 'Token ausente no cabeçalho da requisição'
            });
        }

        const token = authorization.split(' ')[1];
        const assinatura = jwt.verify(token, senhaSegura);

        const { iat, exp, ...usuario } = assinatura;
        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(401).json({ mensagem: error.message });
    }
}

module.exports = verificarLogin;