# language: pt
Funcionalidade: Filtros de produtos
  Como cliente da Toolshop
  Quero filtrar produtos
  Para encontrar os itens que desejo

  Regra: Filtrar por categoria mostra exatamente os produtos dessa categoria
    O oráculo é a própria API da Toolshop, no ambiente onde o teste corre: a interface
    tem de mostrar exatamente os produtos que a API devolve para os mesmos filtros
    (categoria, ordem, página e o intervalo de preço do slider, que por omissão vai de
    $1 a $100). O site público é partilhado (outras pessoas criam produtos), por isso
    uma lista fixa podia falhar sem a loja ter um problema.

    Cenário: Filtrar produtos pela categoria Pliers
      Dado que estou na página de produtos
      Quando filtro pela categoria "Pliers"
      Então vejo os mesmos produtos que a API devolve para esse filtro

    # A ordem por omissão do site não é garantida (já mudou uma vez),
    # por isso ordenamos por nome antes de verificar cada página.
    Cenário: Filtrar produtos pela categoria Other
      Dado que estou na página de produtos
      Quando filtro pela categoria "Other"
      E ordeno os produtos por "nome crescente"
      Então vejo os mesmos produtos que a API devolve para esse filtro

    Cenário: Ver a segunda página de produtos da categoria Other
      Dado que estou na página de produtos
      Quando filtro pela categoria "Other"
      E ordeno os produtos por "nome crescente"
      E vou para a página 2
      Então vejo os mesmos produtos que a API devolve para esse filtro

  @so-local
  Regra: Os dados de demonstração da Toolshop local têm estes produtos por categoria
    Documentam os dados de demonstração (Sprint 5), como o cliente os vê. "Other" tem
    17 produtos, mas 2 custam mais de $100 (Wooden Workbench e Workbench with Drawers)
    e o slider de preço, por omissão de $1 a $100, esconde-os: a interface mostra 15,
    9 na página 1 e 6 na página 2.

    Cenário: Os produtos de demonstração da categoria Pliers
      Dado que estou na página de produtos
      Quando filtro pela categoria "Pliers"
      Então vejo apenas os produtos:
        | Combination Pliers |
        | Pliers             |
        | Bolt Cutters       |
        | Long Nose Pliers   |
        | Slip Joint Pliers  |

    Cenário: Os produtos de demonstração da categoria Other, na página 1
      Dado que estou na página de produtos
      Quando filtro pela categoria "Other"
      E ordeno os produtos por "nome crescente"
      Então vejo apenas os produtos:
        | Construction Helmet   |
        | Cross-head screws     |
        | Drawer Tool Cabinet   |
        | Ear Protection        |
        | Flat-Head Wood Screws |
        | Leather toolbelt      |
        | M4 Nuts               |
        | Nuts and bolts        |
        | Protective Gloves     |

    Cenário: Os produtos de demonstração da categoria Other, na página 2
      Dado que estou na página de produtos
      Quando filtro pela categoria "Other"
      E ordeno os produtos por "nome crescente"
      E vou para a página 2
      Então vejo apenas os produtos:
        | Safety Goggles               |
        | Safety Helmet Face Shield    |
        | Screws                       |
        | Super-thin Protection Gloves |
        | Tool Cabinet                 |
        | Washers                      |

  Regra: Os filtros de preço e a ordenação respeitam o que o cliente escolheu

    # @slow: o slider move-se tecla a tecla, à espera de cada resposta (contorno do bug #1,
    # https://github.com/evangelistaaj/Projeto-toolshop/issues/1). De 100 até 10 são 90 pedidos,
    # e no site público, com vários testes em paralelo, passava dos 30 s.
    @slow
    Esquema do Cenário: Filtrar produtos por preço
      Dado que estou na página de produtos
      Quando filtro por preço entre <preco_min> e <preco_max>
      Então todos os resultados estão dentro do intervalo de preço

      Exemplos:
        | preco_min | preco_max |
        |         0 |       200 |
        |         0 |        10 |
        |        10 |        50 |
        |        50 |       100 |
        |       100 |       200 |

    Cenário: Filtrar por um intervalo de preço sem produtos
      Dado que estou na página de produtos
      Quando filtro por preço entre 190 e 200
      Então sou informado de que não existem produtos

    Esquema do Cenário: Ordenar produtos por <criterio>
      Dado que estou na página de produtos
      Quando ordeno os produtos por "<criterio>"
      Então os produtos aparecem ordenados por "<criterio>"

      Exemplos:
        | criterio          |
        | nome crescente    |
        | nome decrescente  |
        | preço crescente   |
        | preço decrescente |
