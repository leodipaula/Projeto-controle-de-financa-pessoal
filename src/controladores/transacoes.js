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


        const { id } = req.usuario;

        const { rows } = await pool.query(
            'select * from transacoes where usuario_id = $1', [id]
        );


        const acharID = await pool.query('select * from transacoes where usuario_id = $1', [id])

        const acharCategoria = await pool.query('select * from categorias where id = $1', [acharID.rows[0].categoria_id])
        const nome_categoria = acharCategoria.rows[0].descricao




        const listaDasTransacoes = rows.map(transacao => ({
            id: transacao.id,
            tipo: transacao.tipo,
            descricao: transacao.descricao,
            valor: transacao.valor,
            data: transacao.data,
            usuario_id: transacao.usuario_id,
            categoria_id: transacao.categoria_id,
            categoria_nome: nome_categoria
        }));

        return res.status(200).json({ listaDasTransacoes });
    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

const cadastrarTransacao = async (req, res) => {

    try {
        const entrada = "entrada";
        const saida = "saida";
        const userID = req.usuario.id
        const tempo = new Date();
        const { descricao, valor, data, categoria_id, tipo } = req.body

        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: "Todos os dados são obrigatórios" })
        }



        const validaCategoria = await pool.query('select * from categorias where id = $1', [categoria_id])
        if (validaCategoria.rows < 1) {
            return res.status(404).json({ mensagem: "Categoria não encontrada." })

        }

        if (tipo === entrada || tipo === saida) {

            const cadastro = await pool.query('insert into transacoes (descricao, valor, data, categoria_id,usuario_id, tipo) values($1,$2,$3,$4,$5,$6) returning *', [descricao, valor, tempo, categoria_id, userID, tipo])
            return res.status(201).json(cadastro.rows[0])
        }

        else {
            return res.status(400).json({ mensagem: "O campo 'tipo' deve ser ou 'entrada' ou 'saida'." })
        }



    }

    catch (error) {
        console.log(error.message)
        return res.status(500).json("Erro interno do servidor")
    }
}


const detalharTransacoes = async (req, res) => {
    try {
        const { id } = req.usuario;
        const transacaoID = req.params;

        const verificaTransacao = await pool.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [transacaoID, id]
        );

        if (!transacaoEncontrada) {
            return res.status(404).json({ mensagem: 'Transação não encontrada ou não pertence ao usuário logado.' });
        }


        const transacaoEncontrada = verificaTransacao.rows[0];

        const listaDasTransacoes = transacaoEncontrada.map(dado => ({
            id: dado.id,
            tipo: dado.tipo,
            descricao: dado.descricao,
            valor: dado.valor,
            data: dado.data,
            usuario_id: dado.usuario_id,
            categoria_id: dado.categoria_id,
            categoria_nome: dado.categoria_nome,
        }));

        return res.status(201).json(listaDasTransacoes)
    }

    catch (error) {
        console.log(error.message)
        return res.status(500).json("Erro interno do servidor.")
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

const emitirExtrato = async (req, res) => {
    try {
        const { id } = req.usuario.id;

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
            entrada: entradaTotal,
            saida: saidaTotal
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
    emitirExtrato,

}