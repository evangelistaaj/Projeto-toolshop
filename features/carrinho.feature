# language: pt
Funcionalidade: Carrinho
  Como cliente da Toolshop
  Quero gerir os produtos do meu carrinho
  Para comprar só o que preciso, nas quantidades certas

  Contexto:
    Dado que o produto "Combination Pliers" tem stock
    E que tenho o produto "Combination Pliers" no carrinho
    E que abro o meu carrinho

  Cenário: O total acompanha a quantidade
    Quando altero a quantidade de "Combination Pliers" para 3
    Então o total do carrinho é 3 vezes o preço de "Combination Pliers"

  Cenário: Remover o único produto deixa o carrinho vazio
    Quando removo "Combination Pliers" do carrinho
    Então o meu carrinho fica vazio
