const pool = require('../banco_de_dados/conexao');

const listarCategorias = async (req, res) => {
    try {
        const { id } = req.usuario;

        const categoriasCliente = await pool.query(
            'select descricao from categorias where usuario_id = $1', [id]
        );

        const listagemDasCategorias = categoriasCliente.rows.map((row) => ({
            id: row.id,
            descricao: row.descricao
        }));

        return res.status(200).json({ listagemDasCategorias });

    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

const listarTransacoes = async (req, res) => {
    try {
        const { id } = req.body;

        const { rows } = await pool.query(
            'select * from transacoes where usuario_id = $1', [id]
        );

        const listaDasTransacoes = rows.map(transacao => ({
            id: transacao.id,
            tipo: transacao.tipo,
            descricao: transacao.descricao,
            valor: transacao.valor,
            data: transacao.data,
            usuario_id: transacao.usuario_id,
            categoria_id: transacao.categoria_id,
            categoria_nome: transacao.categoria_nome,
        }));

        return res.status(200).json({ listaDasTransacoes });
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

module.exports = {
    listarCategorias,
    listarTransacoes
}