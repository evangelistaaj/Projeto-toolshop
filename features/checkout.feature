# language: pt
@slow @sem-ci
Funcionalidade: Checkout
  Como cliente da Toolshop
  Quero finalizar a compra dos produtos do meu carrinho
  Para receber as ferramentas que escolhi

  Contexto:
    Dado que o produto "Combination Pliers" tem stock
    E que tenho o produto "Combination Pliers" no carrinho

  @com-conta
  Regra: O cliente com conta compra depois de iniciar sessão

    Contexto:
      Dado que tenho uma conta registada
      E que inicio sessão no checkout com a conta registada
      E que indico uma morada de entrega válida

    Cenário: Comprar com pagamento na entrega
      Dado que escolho o método de pagamento "Cash on Delivery"
      Quando confirmo a encomenda
      Então vejo a confirmação da encomenda com um número de fatura

  @convidado
  Regra: O cliente sem conta compra como convidado

    Contexto:
      Dado que continuo como convidado no checkout
      E que indico uma morada de entrega válida

    Esquema do Cenário: Comprar com <descricao>
      Dado que escolho o método de pagamento "<metodo>"
      Quando confirmo a encomenda
      Então vejo a confirmação da encomenda com um número de fatura

      Exemplos:
        | metodo           | descricao              |
        | Cash on Delivery | pagamento na entrega   |
        | Bank Transfer    | transferência bancária |
        | Credit Card      | cartão de crédito      |
        | Gift Card        | cartão de presente     |

    Esquema do Cenário: Comprar com pagamento em <parcelas>
      Dado que escolho o método de pagamento "Buy Now Pay Later" em "<parcelas>"
      Quando confirmo a encomenda
      Então vejo a confirmação da encomenda com um número de fatura

      Exemplos:
        | parcelas                |
        |  3 Monthly Installments |
        |  6 Monthly Installments |
        |  9 Monthly Installments |
        | 12 Monthly Installments |

    Cenário: O carrinho fica vazio depois de finalizar a compra
      Dado que escolho o método de pagamento "Cash on Delivery"
      Quando confirmo a encomenda
      Então o meu carrinho fica vazio
