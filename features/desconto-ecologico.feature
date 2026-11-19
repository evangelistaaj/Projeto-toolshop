# language: pt
@so-local
Funcionalidade: Desconto ecológico no carrinho
  Como cliente da Toolshop
  Quero ver no carrinho o desconto por comprar produtos amigos do ambiente
  Para saber quanto vou pagar antes de finalizar a compra

  Um produto é ecológico se a classificação CO2 for A ou B. Há 5% de desconto
  quando mais de metade das unidades no carrinho são de produtos ecológicos.
  Os produtos de cada cenário são criados com o preço e a classificação
  indicados, e apagados no fim.

  Regra: O carrinho mostra 5% de desconto quando mais de metade das unidades são ecológicas

    Cenário: Com a maioria das unidades ecológicas o carrinho mostra o desconto
      Dado que tenho no carrinho os produtos:
        | produto       | quantidade | preço | CO2 |
        | Bamboo Hammer |          2 | 10.00 | A   |
        | Steel Saw     |          1 |  5.00 | D   |
      Quando abro o meu carrinho
      Então o carrinho mostra o desconto ecológico de "$1.25"
      E o subtotal do carrinho é "$25.00"
      E o total do carrinho é "$23.75"

    Cenário: Com exatamente metade das unidades ecológicas não há desconto
      Dado que tenho no carrinho os produtos:
        | produto       | quantidade | preço | CO2 |
        | Bamboo Hammer |          1 | 10.00 | A   |
        | Steel Saw     |          1 | 10.00 | D   |
      Quando abro o meu carrinho
      Então o carrinho não mostra desconto ecológico
      E o total do carrinho é "$20.00"

    Cenário: O desconto aparece quando a maioria das unidades passa a ser ecológica
      Dado que tenho no carrinho os produtos:
        | produto       | quantidade | preço | CO2 |
        | Bamboo Hammer |          1 | 10.00 | A   |
        | Steel Saw     |          1 | 10.00 | D   |
      E que abro o meu carrinho
      Quando altero a quantidade de "Bamboo Hammer" para 2
      Então o carrinho mostra o desconto ecológico de "$1.50"
      E o total do carrinho é "$28.50"

  @slow @sem-ci
  Regra: O cliente paga o total que viu no carrinho

    Esquema do Cenário: A fatura tem o total do carrinho, com um subtotal de <subtotal>
      Dado que tenho no carrinho os produtos:
        | produto       | quantidade   | preço   | CO2 |
        | Bamboo Hammer | <quantidade> | <preco> | A   |
      E que vejo o total no carrinho
      E que tenho uma conta registada
      E que inicio sessão no checkout com a conta registada
      E que indico uma morada de entrega válida
      E que escolho o método de pagamento "Cash on Delivery"
      Quando confirmo a encomenda
      Então vejo a confirmação da encomenda com um número de fatura
      E a fatura nas minhas faturas tem o total que o carrinho mostrava
      # Controlo: aqui o desconto não cai a meio cêntimo, e o carrinho e a fatura batem certo

      Exemplos:
        | quantidade | preco | subtotal |
        |          3 |  9.99 |    29.97 |
      # Bug #5: com 10.10, o carrinho mostra $9.59 e a fatura cobra $9.60. O carrinho só
      # arredonda no ecrã; a API arredonda o desconto e o total, cada um à sua conta.
      # https://github.com/evangelistaaj/Projeto-toolshop/issues/5
      # @fail: o exemplo "passa" enquanto o bug existir. Quando o bug for corrigido,
      # o Playwright avisa (o exemplo deixa de falhar) e é altura de tirar o @fail.

      @bug @fail
      Exemplos:
        | quantidade | preco | subtotal |
        |          1 | 10.10 |    10.10 |
