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

  # Bug de acessibilidade: o botão de remover é só um ícone "x" (<a class="btn-danger">),
  # sem texto, sem aria-label e sem papel de botão; um leitor de ecrã não o anuncia.
  # https://github.com/evangelistaaj/Projeto-toolshop/issues/6
  # @fail: o cenário "passa" enquanto o bug existir. Quando o bug for corrigido,
  # o Playwright avisa (o cenário deixa de falhar) e é altura de tirar o @fail.
  @bug @fail
  Cenário: O botão de remover um produto é anunciado por um leitor de ecrã
    Então o botão de remover "Combination Pliers" tem um nome que um leitor de ecrã anuncia
