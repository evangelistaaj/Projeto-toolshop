# language: pt
Funcionalidade: Filtros de produtos
  Como cliente da Toolshop
  Quero filtrar produtos
  Para encontrar os itens que desejo

  Cenário: Filtrar produtos pela categoria Pliers
    Dado que estou na página de produtos
    Quando filtro pela categoria "Pliers"
    Então vejo apenas os produtos:
      | Combination Pliers |
      | Pliers             |
      | Bolt Cutters       |
      | Long Nose Pliers   |
      | Slip Joint Pliers  |

  Cenário: Filtrar produtos pela categoria Other
    Dado que estou na página de produtos
    Quando filtro pela categoria "Other"
    Então vejo apenas os produtos:
      | Construction Helmet          |
      | Cross-head screws            |
      | Ear Protection               |
      | Nuts and bolts               |
      | Protective Gloves            |
      | Safety Goggles               |
      | Safety Helmet Face Shield    |
      | Screws                       |
      | Super-thin Protection Gloves |

  Cenário: Ver a segunda página de produtos da categoria Other
    Dado que estou na página de produtos
    Quando filtro pela categoria "Other"
    E vou para a página 2
    Então vejo apenas os produtos:
      | M4 Nuts               |
      | Washers               |
      | Tool Cabinet          |
      | Drawer Tool Cabinet   |
      | Flat-Head Wood Screws |
      | Leather toolbelt      |

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
