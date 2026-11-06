# language: pt
Funcionalidade: Registo de utilizador
  Como visitante da Toolshop
  Quero criar uma conta
  Para poder fazer compras

  @sem-ci
  Cenário: Registo com dados válidos
    Dado que estou na página de registo
    Quando registo um novo utilizador com dados válidos
    Então sou redirecionado para a página de login
