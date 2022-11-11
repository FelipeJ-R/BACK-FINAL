const knex = require('../conexao');
const aws = require('../servicos/aws');

const listarProdutos = async (req, res) => {
    const { nome } = req.query;

    try {
        const produtos = await knex('produtos')
            .where(query => {
                if (nome) {
                    return query.where('nome', 'ilike', `%${nome}%`);
                }
            });

        if (!produtos) {
            return res.status(404).json('Nenhum resultado foi encontrado');
        } else {
            return res.status(200).json(produtos);
        }

    } catch (error) {
        return res.status(400).json(error.message);
    }
}
const listarMeusProdutos = async (req, res) => {
    const { usuario } = req;

    try {
        const produtos = await knex('produtos')
            .where({ usuario_id: usuario.id })

        if (!produtos) {
            return res.status(404).json('Nenhum produto cadastrado');
        } else {
            return res.status(200).json(produtos);
        }


    } catch (error) {
        return res.status(400).json(error.message);
    }
}


const cadastrarProduto = async (req, res) => {
    const { usuario } = req;
    const { nome, estoque, preco, categoria, descricao, nomeImagem } = req.body;

    if (!nome) {
        return res.status(404).json('O campo nome é obrigatório');
    }

    if (!estoque || estoque % estoque !== 0) {
        return res.status(404).json('O campo estoque precisa ser preenchido corretamente');
    }

    if (!preco || preco % preco !== 0) {
        return res.status(404).json('O campo preco precisa ser preenchido corretamente');
    }

    if (!descricao) {
        return res.status(404).json('O campo descricao é obrigatório');
    }

    try {
        const produto = await knex('produtos').insert({
            usuario_id: usuario.id,
            nome,
            estoque,
            preco,
            categoria,
            descricao,
            imagem: `usuarios/${usuario.id}/${nomeImagem}`
        }).returning('*');

        if (!produto) {
            return res.status(400).json('O produto não foi cadastrado');
        }
        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}
const atualizarImagemProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    const { imagem, nomeImagem } = req.body;

    if (!imagem) {
        return res.status(404).json('O campo imagem é obrigatório');
    }

    if (!nomeImagem) {
        return res.status(404).json('O campo nomeImagem é obrigatório');
    }

    try {
        const produto = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado');
        }

        await aws.excluirImagem(produto.imagem);

        const buffer = Buffer.from(imagem, 'base64');
        await aws.enviarImagem(`guidocerqueira/${nomeImagem}`, buffer);

        const produtoAtualizado = await knex('produtos')
            .where({
                id,
                usuario_id: usuario.id
            }).update({
                imagem: `guidocerqueira/${nomeImagem}`
            });

        if (!produtoAtualizado) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json('Imagem do produto foi atualizada com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirImagemProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado');
        }

        await aws.excluirImagem(produto.imagem);

        const produtoAtualizado = await knex('produtos')
            .where({
                id,
                usuario_id: usuario.id
            }).update({
                imagem: null
            });

        if (!produtoAtualizado) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json('Imagem do produto excluida com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    const { nome, estoque, preco, categoria, descricao, imagem } = req.body;

    if (!nome && !estoque && !preco && !categoria && !descricao && !imagem) {
        return res.status(404).json('Informe ao menos um campo para atualizaçao do produto');
    }

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const produto = await knex('produtos')
            .where({ id })
            .update({
                nome,
                estoque,
                preco,
                categoria,
                descricao,
                imagem
            });

        if (!produto) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json('produto foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}
const comprarProduto = async (req, res) => {
    const { id } = req.params;
    const { quantidade } = req.body;

    if (quantidade % quantidade !== 0 && quantidade > 0) {
        return res.status(404).json('Verifique quantos itens pretende comprar');
    }

    try {
        const produtoEncontrado = await knex('produtos').where({
            id: id
        });

        if (produtoEncontrado === undefined) {
            return res.status(404).json('Produto não encontrado');
        } else if (produtoEncontrado[0].estoque === 0) {
            return res.status(404).json(`Infelizmente o estoque de ${produtoEncontrado[0].nome} está zerado`)
        } else if (produtoEncontrado[0].estoque < quantidade) {
            return res.status(404).json(`Infelizmente o estoque de ${produtoEncontrado[0].nome} é de apenas ${produtoEncontrado[0].estoque} `)
        }

        const produto = await knex('produtos')
            .where({ id })
            .update({
                nome: produtoEncontrado[0].nome,
                estoque: produtoEncontrado[0].estoque - quantidade,
                preco: produtoEncontrado[0].preco,
                categoria: produtoEncontrado[0].categoria,
                descricao: produtoEncontrado[0].descricao,
                imagem: produtoEncontrado[0].imagem,
                vendidos: produtoEncontrado[0].vendidos + quantidade
            });

        if (!produto) {
            return res.status(400).json("Problema na compra. Tente novamente");
        }

        return res.status(200).json('Compra realizada com sucesso.');

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const produtoExcluido = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).del();

        if (!produtoExcluido) {
            return res.status(400).json("O produto não foi excluido");
        }

        return res.status(200).json('Produto excluido com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarProdutos,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto,
    atualizarImagemProduto,
    excluirImagemProduto,
    listarMeusProdutos,
    comprarProduto
}