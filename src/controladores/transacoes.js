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

module.exports = {
    listarCategorias
}