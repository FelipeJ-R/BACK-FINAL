const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const produtos = require('./controladores/produtos');
const verificaLogin = require('./filtros/verificaLogin');


const rotas = express();

rotas.post('/usuarios', usuarios.cadastrarUsuario);


rotas.post('/login', login.login);
rotas.get('/meusprodutos', produtos.listarProdutos)

rotas.use(verificaLogin);


rotas.get('/perfil', usuarios.obterPerfil);
rotas.put('/perfil', usuarios.atualizarPerfil);

rotas.get('/meusprodutos', produtos.listarMeusProdutos);
rotas.post('/produtos', produtos.cadastrarProduto);
rotas.put('/produtos/:id', produtos.atualizarProduto);
rotas.put('/comprarprodutos/:id', produtos.comprarProduto);
rotas.delete('/produtos/:id', produtos.excluirProduto);
rotas.put('/produtos/:id/imagem', produtos.atualizarImagemProduto)
rotas.delete('/produtos/:id/imagem', produtos.excluirImagemProduto);
module.exports = rotas;