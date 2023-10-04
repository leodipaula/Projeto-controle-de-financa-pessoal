const express = require("express");
const { cadastrarUsuario, fazerLogin } = require("./controladores/usuarios");
const verificarLogin = require("./intermediarios/autenticacao");


const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', fazerLogin);
rotas.use(verificarLogin);

module.exports = rotas;