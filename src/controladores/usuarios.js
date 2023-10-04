const pool = require('../banco_de_dados/conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: "O preenchimento de todos os campos são obrigatórios." });
        }

        const usuarioExistente = await pool.query(
            'select * from usuarios where email = $1', [email]
        );

        if (usuarioExistente.rowCount > 0) {
            return res.status(400).json({ mensagem: "já existe email cadastrado." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoUsuario = await pool.query(
            'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *',
            [nome, email, senhaCriptografada]
        );

        return res.status(201).json(novoUsuario.rows[0]);
    } catch (error) {
        return res.status(400).json({ mensagem: error.message });
    }
}

module.exports = {
    cadastrarUsuario
}