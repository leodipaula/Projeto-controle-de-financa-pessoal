const express = require("express");
const {
    cadastrarUsuario,
    fazerLogin,
    detalharUsuario,
    atualizarUsuario
} = require("./controladores/usuarios");
const verificarLogin = require("./intermediarios/autenticacao");
const {
    listarCategorias,
    listarTransacoes,
    detalharTransacoes,
    cadastrarTransacao,
    atualizarTransacao
} = require("./controladores/transacoes");


const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', fazerLogin);
rotas.use(verificarLogin);
rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);
rotas.get('/categoria', listarCategorias);
rotas.get('/transacao', listarTransacoes);
rotas.get('/transacao/:id', detalharTransacoes);
rotas.post('/transacao', cadastrarTransacao);
rotas.put('transacao/:id', atualizarTransacao)

module.exports = rotas;