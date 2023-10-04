const express = require("express");
const {
    cadastrarUsuario,
    fazerLogin,
    detalharUsuario
} = require("./controladores/usuarios");
const verificarLogin = require("./intermediarios/autenticacao");


const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', fazerLogin);
rotas.use(verificarLogin);
rotas.get('/usuario', detalharUsuario);

module.exports = rotas;