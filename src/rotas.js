const express = require("express");
const {
    cadastrarUsuario,
    fazerLogin,
    detalharUsuario,
    atualizarUsuario
} = require("./controladores/usuarios");
const verificarLogin = require("./intermediarios/autenticacao");
const {
    listarCategorias
} = require("./controladores/transacoes");


const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', fazerLogin);
rotas.use(verificarLogin);
rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);
rotas.get('/categoria', listarCategorias);

module.exports = rotas;