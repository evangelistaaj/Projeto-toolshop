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

    Cenário: A fatura fica disponível nas faturas do cliente
      Dado que escolho o método de pagamento "Cash on Delivery"
      Quando confirmo a encomenda
      Então vejo a confirmação da encomenda com um número de fatura
      E encontro essa fatura nas minhas faturas

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

  @convidado @negativo
  Regra: O checkout não avança com dados inválidos

    Cenário: Convidado com email inválido
      Quando tento continuar como convidado com o email "email-invalido"
      Então vejo o aviso "Email format is invalid"

    Cenário: Morada de entrega sem rua
      Dado que continuo como convidado no checkout
      Quando indico uma morada de entrega sem rua
      Então não consigo avançar para o pagamento

    Esquema do Cenário: Cartão de crédito com <descricao>
      Dado que continuo como convidado no checkout
      E que indico uma morada de entrega válida
      Quando pago com cartão de crédito com <campo> "<valor>"
      Então vejo o aviso "<aviso>"
      E não consigo confirmar a encomenda

      Exemplos:
        | campo    | valor     | descricao                  | aviso                                  |
        | número   | 1234-5678 | número incompleto          | Invalid card number format.            |
        | validade | 01/2020   | validade no passado        | Expiration date must be in the future. |
        | CVV      | 12        | CVV com só dois algarismos | CVV must be 3 or 4 digits.             |

  @convidado
  Regra: O cliente é avisado quando a encomenda não é criada

    # Bug: a API recusa a fatura (422) e o ecrã não mostra nada; o cliente pensa que comprou.
    # A Toolshop ignora o erro (no código: "error: () => { }"). Issue #4 (a criar).
    # @fail: o cenário "passa" enquanto o bug existir. Quando o bug for corrigido,
    # o Playwright avisa (o cenário deixa de falhar) e é altura de tirar o @fail.
    @bug @fail
    Cenário: Encomenda recusada por uma cidade que não corresponde ao código postal
      Dado que continuo como convidado no checkout
      E que indico uma morada de entrega com uma cidade que não corresponde ao código postal
      E que escolho o método de pagamento "Cash on Delivery"
      Quando confirmo a encomenda
      Então sou avisado de que a encomenda não foi criada
