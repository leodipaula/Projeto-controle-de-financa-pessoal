const pool = require('../banco_de_dados/conexao');

const listarCategorias = async (req, res) => {
    try {
        const categoriasQuery = await pool.query('SELECT * FROM categorias');
        const categorias = categoriasQuery.rows;

        return res.status(200).json({ categorias });
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

const listarTransacoes = async (req, res) => {
    try {
        const { id } = req.usuario;

        const { rows, rowCount } = await pool.query(
            'SELECT * FROM transacoes WHERE usuario_id = $1',
            [id]
        );

        if (rowCount < 1) {
            return res.status(400).json({ mensagem: "Não foi encontrado transações em sua conta." });
        }

        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}


const detalharTransacoes = async (req, res) => {
    try {
        const { id: idUsuario } = req.usuario;
        const { id: idTransacao } = req.params;

        if (!idTransacao) {
            return res.status(400).json({ mensagem: "ID da transação não foi informado." });
        }

        const transacao = await pool.query(
            'select * from transacoes where id = $1 and usuario_id = $2', [idTransacao, idUsuario]
        );

        if (transacao.rows.length < 1) {
            return res.status(404).json({ mensagem: "Transação não encontrada." })
        }

        return res.status(200).json(transacao.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}


const cadastrarTransacao = async (req, res) => {
    try {
        const { id } = req.usuario;
        const { descricao, valor, data, categoria_id, tipo } = req.body;

        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
        }

        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({
                mensagem: 'O campo "tipo" deve ser "entrada" ou "saida".'
            });
        }
        const categoriaQuery = await pool.query('SELECT descricao FROM categorias WHERE id = $1', [categoria_id]);
        const categoria = categoriaQuery.rows[0];

        if (!categoria) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
        }

        const result = await pool.query(
            'INSERT INTO transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) VALUES ($1, $2, $3, $4, $5, $6) returning *',
            [descricao, valor, data, categoria_id, id, tipo]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

const atualizarTransacao = async (req, res) => {
    try {
        const { id: usuarioID } = req.usuario;
        const { id: transacaoID } = req.params;
        const { descricao, valor, data, categoria_id, tipo } = req.body;

        if (!transacaoID) {
            return res.status(400).json({ mensagem: "ID da transação não foi informado." });
        }

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

        if (transacao.usuario_id !== usuarioID) {
            return res.status(400).json({ mensagem: 'o ID da transação encontrada pertence a outro usuario.' });
        }

        const categoriaQuery = await pool.query('select * from categorias where id = $1',
            [categoria_id]
        );
        const categoria = categoriaQuery.rows[0];

        if (!categoria) {
            return res.status(404).json({
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
        const { id: usuarioID } = req.usuario;
        const { id: transacaoID } = req.params;

        if (!transacaoID) {
            return res.status(400).json({ mensagem: "ID da transação não foi informado." });
        }

        const transacaoQuery = await pool.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [transacaoID, usuarioID]
        );
        const transacao = transacaoQuery.rows[0];

        if (!transacao) {
            return res.status(404).json({
                mensagem: 'Transação não encontrada.'
            });
        }

        await pool.query('delete from transacoes where id = $1', [transacaoID]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

const emitirExtrato = async (req, res) => {
    try {
        const { id } = req.usuario;

        const entradaQuery = await pool.query(
            'SELECT COALESCE(SUM(valor), 0) AS entrada FROM transacoes WHERE usuario_id = $1 AND tipo = $2',
            [id, 'entrada']
        );
        const { entrada: entradaTotal } = entradaQuery.rows[0];

        const saidaQuery = await pool.query(
            'SELECT COALESCE(SUM(valor), 0) AS saida FROM transacoes WHERE usuario_id = $1 AND tipo = $2',
            [id, 'saida']
        );
        const { saida: saidaTotal } = saidaQuery.rows[0];

        return res.status(200).json({
            entrada: +entradaTotal,
            saida: +saidaTotal
        });
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
    deletarTransacao,
    emitirExtrato
}