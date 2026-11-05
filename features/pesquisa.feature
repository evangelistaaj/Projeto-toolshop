# language: pt
Funcionalidade: Pesquisa de produtos
  Como cliente da Toolshop
  Quero pesquisar por produtos
  Para encontrar os itens que desejo

  Esquema do Cenário: Pesquisar por um produto existente
    Dado que estou na página de produtos
    Quando pesquiso por "<termo>"
    Então todos os resultados contêm "<termo>"

    Exemplos:
      | termo  |
      | pliers |
      | hammer |
      | saw    |

  Cenário: Pesquisar sem resultados
    Dado que estou na página de produtos
    Quando pesquiso por "produto-inexistente-xyz123"
    Então sou informado de que não existem produtos
