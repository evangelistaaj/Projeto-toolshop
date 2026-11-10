# language: pt
@slow
Funcionalidade: Checkout
  Como cliente da Toolshop
  Quero finalizar a compra dos produtos do meu carrinho
  Para receber as ferramentas que escolhi

  Contexto:
    Dado que o produto "Combination Pliers" tem stock
    E que tenho o produto "Combination Pliers" no carrinho

  @sem-ci
  Cenário: Comprar com conta registada e pagamento na entrega
    Dado que tenho uma conta registada
    E que inicio sessão no checkout com a conta registada
    E que indico uma morada de entrega válida
    E que escolho o método de pagamento "Cash on Delivery"
    Quando confirmo a encomenda
    Então vejo a confirmação da encomenda com um número de fatura

  @sem-ci
  Cenário: Comprar como convidado e pagamento na entrega
    Dado que continuo como convidado no checkout
    E que indico uma morada de entrega válida
    E que escolho o método de pagamento "Cash on Delivery"
    Quando confirmo a encomenda
    Então vejo a confirmação da encomenda com um número de fatura

  @sem-ci
  Esquema do Cenário: Comprar como convidado com pagamento em prestações
    Dado que continuo como convidado no checkout
    E que indico uma morada de entrega válida
    E que escolho o método de pagamento "Buy Now Pay Later" em "<parcelas>"
    Quando confirmo a encomenda
    Então vejo a confirmação da encomenda com um número de fatura

    Exemplos:
      | parcelas                |
      |  3 Monthly Installments |
      |  6 Monthly Installments |
      |  9 Monthly Installments |
      | 12 Monthly Installments |
