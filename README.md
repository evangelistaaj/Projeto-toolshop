# 🎭 Testes Automatizados com Playwright + BDD – Toolshop

![Playwright Tests](https://github.com/evangelistaaj/Projeto-toolshop/actions/workflows/playwright.yml/badge.svg)

Projeto de automação de testes end-to-end (E2E) da aplicação de e-commerce [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com/), desenvolvido com **Playwright**, **TypeScript** e **BDD (Gherkin)**.

Os cenários são escritos primeiro como **testes funcionais em Gherkin (português)** e depois ligados à automação, seguindo o fluxo: **cenário funcional → step definitions → Page Objects**.

> 🚧 Projeto em desenvolvimento: novos cenários são adicionados regularmente.

## 🛠️ Tecnologias

- [Playwright](https://playwright.dev/) – framework de testes E2E
- [playwright-bdd](https://github.com/vitalets/playwright-bdd) – execução de cenários Gherkin com o Playwright
- [Faker](https://fakerjs.dev/) – geração de dados de teste realistas (em português de Portugal)
- Gherkin (em português)
- TypeScript
- Node.js
- Git e GitHub Actions

## 📝 Exemplo de cenário

```gherkin
# language: pt
Funcionalidade: Filtros de produtos

  Contexto:
    Dado que estou na página de produtos

  Esquema do Cenário: Filtrar produtos por preço entre <preco_min> e <preco_max>
    Quando filtro por preço entre <preco_min> e <preco_max>
    Então todos os resultados estão dentro do intervalo de preço

    Exemplos:
      | preco_min | preco_max |
      |         0 |       200 |
      |         0 |        10 |
      |        10 |        50 |
      |        50 |       100 |
      |       100 |       200 |
```

## ✅ Cenários testados

**Registo de utilizador** (`features/registo.feature`)
- Registo com dados válidos gerados aleatoriamente, com morada preenchida a partir do código postal

**Login** (`features/login.feature`)
- Login com uma conta acabada de criar
- Login com credenciais inválidas (mensagem de erro)

**Pesquisa de produtos** (`features/pesquisa.feature`)
- Pesquisa por produto existente, validando que todos os resultados contêm o termo pesquisado
- Pesquisa por produto inexistente (mensagem de que não existem produtos)

**Filtros, ordenação e paginação** (`features/filtros.feature`)
- Filtro por intervalo de preço, com partições de equivalência e valores limite (incluindo um intervalo sem produtos)
- Ordenação por nome e por preço, crescente e decrescente
- Filtro por categoria, validando a lista exata de produtos esperados
- Paginação de resultados filtrados

**Próximos passos**
- Ordenação por classificação CO₂
- Carrinho e checkout
- Massa de teste em ficheiros JSON
- Testes de carga com k6, contra uma instância local do Toolshop em Docker

Todos os cenários correm em **3 browsers**: Chromium, Firefox e WebKit.

## 🧱 Boas práticas aplicadas

**Desenho dos cenários**
- **BDD com Gherkin**: cenários legíveis para toda a equipa (QA, PO, desenvolvimento), que servem ao mesmo tempo de documentação e de testes executáveis
- **Cenários declarativos**, com **um comportamento por cenário**
- **Linguagem de negócio nos cenários**: valores técnicos (como `name,asc`) traduzidos no código através de um dicionário
- **Contexto (Background)** para passos comuns a todos os cenários de uma funcionalidade
- **Esquema do Cenário** e **tabelas de dados (Data Tables)** para testes orientados a dados
- **Técnicas de desenho de testes**: partição de equivalência, análise de valores limite e seleção de casos baseada em risco
- **Oráculos fortes**: verificação da lista exata de produtos esperados, em vez de heurísticas frágeis

**Automação**
- **Steps reutilizáveis e organizados por assunto** (navegação, conta, filtros…), partilhados por todas as funcionalidades
- **Page Object Model (POM)**: cada página do site tem a sua classe com elementos e ações
- **Localizadores estáveis**: `getByTestId()` com o atributo `data-test`, e localizadores acessíveis (`getByRole`, `getByLabel`) quando os test ids contêm identificadores internos
- **Interação acessível com componentes complexos**: o slider de preço é controlado por teclado (Home/End, Page Up/Down, setas), sem depender de posições em píxeis
- **`baseURL` configurado**: o endereço do site está definido num único sítio

**Dados e estabilidade**
- **Isolamento de dados de teste**: cada cenário cria os seus próprios dados com uma fábrica (`utils/dados.ts`) baseada no Faker, sem depender de contas partilhadas
- **Fixtures para partilhar estado entre steps**: cada cenário recebe o seu próprio contexto isolado, seguro em execução paralela
- **Sincronização sem esperas fixas**: cada ação que recarrega dados espera pela resposta da API antes de o teste continuar
- **Regras de negócio respeitadas**: a morada do registo é a devolvida pela procura do código postal, tal como acontece com um utilizador real

**Execução e evidências**
- **Tags para controlar a execução**: `@sem-ci` (só local) e `@wip` (trabalho em curso)
- **Evidências automáticas em caso de falha**: screenshot, vídeo e trace
- **Integração Contínua (CI)**: os cenários correm automaticamente no GitHub Actions a cada push

> ℹ️ Cenários marcados com `@sem-ci` correm apenas localmente: o site usa proteção anti-bot (Cloudflare) nas áreas de conta para tráfego vindo de datacenters, como o GitHub Actions. Num projeto real, o CI correria contra um ambiente de testes sem essa proteção.

## 🔍 Descobertas durante a automação

Algumas observações sobre o comportamento da aplicação, encontradas ao investigar falhas dos testes:

- **Resultados de filtro desatualizados**: quando o filtro de preço muda várias vezes seguidas (por exemplo, com o teclado), as respostas da API podem chegar fora de ordem e a lista mostra produtos que não correspondem ao filtro visível. Os testes contornam isto esperando por cada resposta antes da ação seguinte.
- **Bloqueio de contas partilhadas**: as contas de demonstração ficam bloqueadas após várias tentativas de login falhadas, o que motivou a criação de utilizadores próprios em cada cenário.
- **Morada validada pelo código postal**: o registo só aceita moradas coerentes com o código postal, e o formulário preenche-as automaticamente após uma procura na API.
- **Categorias vs. nomes de produtos**: alguns produtos pertencem a uma categoria sem a incluírem no nome (por exemplo, *Bolt Cutters* em *Pliers*), o que tornou necessária a validação pela lista exata de produtos.
- **Valores limite sem resultados**: não existem produtos no intervalo de preço entre 190 e 200, um caso coberto por um cenário próprio.

## 📁 Estrutura do projeto

```
├── .github/workflows/      # Pipeline de CI (GitHub Actions)
├── features/               # Cenários funcionais em Gherkin
│   ├── filtros.feature
│   ├── login.feature
│   ├── pesquisa.feature
│   └── registo.feature
├── steps/                  # Step definitions (ligação Gherkin → código)
│   ├── fixtures.ts         # Contexto partilhado entre steps de um cenário
│   ├── navegacao.steps.ts  # Passos de navegação comuns
│   ├── conta.steps.ts
│   ├── filtros.steps.ts
│   ├── login.steps.ts
│   ├── pesquisa.steps.ts
│   └── registo.steps.ts
├── pages/                  # Page Objects
│   ├── AccountPage.ts
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   └── RegisterPage.ts
├── utils/
│   └── dados.ts            # Fábrica de dados de teste (Faker)
├── playwright.config.ts    # Configuração do Playwright e do playwright-bdd
└── tsconfig.json           # Configuração do TypeScript
```

## ▶️ Como executar

**Pré-requisito:** [Node.js](https://nodejs.org/) (versão LTS)

```bash
# 1. Instalar as dependências
npm install

# 2. Instalar os browsers do Playwright
npx playwright install

# 3. Gerar os testes a partir dos cenários e correr tudo
npm test

# 4. Abrir o relatório
npx playwright show-report
```

Outros comandos úteis:

```bash
npm run test:ui                         # Modo interativo
npm test -- --project=chromium          # Só no Chromium
npm test -- --headed                    # Mostrar o browser
npm test -- --grep "preço"              # Só os cenários com "preço" no nome
npm test -- --debug                     # Modo de depuração, passo a passo
```

> ℹ️ O comando `bddgen` gera os testes Playwright a partir dos ficheiros `.feature` (na pasta `.features-gen`, ignorada pelo Git). Os atalhos `npm test` e `npm run test:ui` já o executam automaticamente.

## 👤 Autor

**Arthur Evangelista**
