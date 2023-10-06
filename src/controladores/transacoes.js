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


const detalharTransacoes = async (req, resp) => {
    const { id } = req.params


    const verificaId = await pool.query('select * from transacoes where id = $1', [id])
    if (verificaId.rows < 1) {
        return resp.status(404).json({ mensagem: "Transação não encontrada." })
    }

    try {
        return resp.status(200).json(verificaId.rows[0])

    }
    catch (error) {
        return resp.status(500).json("Erro interno do servidor.")
    }

}


const cadastrarTransacao = async (req, resp) => {

    const { descricao, valor, data, categoria_id, tipo } = req.body

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return resp.status(400).json({ mensagem: "Todos os dados são obrigatórios" })
    }

    const validaCategoria = await pool.query('select * from transacoes where categoria_id = $1', [categoria_id])
    if (validaCategoria.rows < 1) {
        return resp.status(500).json("Erro interno do servidor")
    }

    if (tipo !== entrada || tipo !== saida) {
        return resp.status(500).json("Erro interno do servidor")
    }
    else {

        try {
            const cadastro = await pool.query('insert into transacoes (descricao, valor, data,categoria_id, tipo) values($1,$2,$3,$4,$5', [descricao, valor, data, categoria_id, tipo])
            return resp.status(201).json(validaCategoria.rows[0])
        }

        catch (error) {
            return resp.status(500).json("Erro interno do servidor")
        }
    }
}

const atualizarTransacao = async (req, res) => {
    try {
        const usuarioID = req.usuario.id;
        const transacaoID = req.params.id;
        const { descricao, valor, data, categoria_id, tipo } = req.body;

        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({
                mensagem: 'Todos os campos (descricao, valor, data, categoria_id, tipo) são obrigatórios.'
            });
        }

        const transacaoQuery = await pool.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [transacaoID, usuarioID]
        );
        const transacao = transacaoQuery.rows[0];

        if (!transacao) {
            return res.status(404).json({
                mensagem: 'Transação informada não existe.'
            });
        }

        const categoriaQuery = await pool.query('select * from categorias where id = $1',
            [categoria_id]
        );
        const categoria = categoriaQuery.rows[0];

        if (!categoria) {
            return res.status(400).json({
                mensagem: 'Categoria não encontrada.'
            });
        }

        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({
                mensagem: 'O campo "tipo" deve ser "entrada" ou "saida".'
            });
        }

        await pool.query(
            'update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6',
            [descricao, valor, data, categoria_id, tipo, transacaoID]
        );

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

const deletarTransacao = async (req, res) => {
    try {
        const usuarioID = req.usuario.id;
        const transacaoID = req.params.id;

        const transacaoQuery = await pool.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [transacaoID, usuarioID]
        );
        const transacao = transacaoQuery.rows[0];

        if (!transacao) {
            return res.status(404).json({
                mensagem: 'Transação não encontrada ou não pertence ao usuário logado.'
            });
        }

        await pool.query('delete from transacoes where id = $1', [transacaoID]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

module.exports = {
    listarCategorias,
    listarTransacoes,
    detalharTransacoes,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTransacao
}