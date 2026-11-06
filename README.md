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
Funcionalidade: Login

  @sem-ci
  Cenário: Login com uma conta nova
    Dado que tenho uma conta registada
    E que estou na página de login
    Quando faço login com a conta registada
    Então vejo a página "My account"
```

Cada execução cria **um utilizador novo** com dados gerados pelo Faker, por isso o teste nunca depende de contas partilhadas.

## ✅ Cenários testados

**Registo de utilizador** (`features/registo.feature`)
- Registo com dados válidos gerados aleatoriamente, com morada preenchida a partir do código postal

**Login** (`features/login.feature`)
- Login com uma conta acabada de criar
- Login com credenciais inválidas (mensagem de erro)

**Pesquisa de produtos** (`features/pesquisa.feature`)
- Pesquisa por produto existente, validando que todos os resultados contêm o termo pesquisado (Esquema do Cenário com 3 exemplos)
- Pesquisa por produto inexistente (mensagem de que não existem produtos)

**Próximos passos**
- Filtros por categoria
- Carrinho e checkout
- Testes de carga com k6, contra uma instância local do Toolshop em Docker

Todos os cenários correm em **3 browsers**: Chromium, Firefox e WebKit.

## 🧱 Boas práticas aplicadas

- **BDD com Gherkin**: cenários legíveis para toda a equipa (QA, PO, desenvolvimento), que servem ao mesmo tempo de documentação e de testes executáveis
- **Cenários declarativos**: descrevem o que o utilizador faz, não os detalhes do ecrã
- **Steps reutilizáveis**: frases parametrizadas com `{string}`, usadas em vários cenários sem código novo
- **Esquema do Cenário**: testes orientados a dados com tabelas de Exemplos
- **Isolamento de dados de teste**: cada cenário cria os seus próprios dados com uma fábrica (`utils/dados.ts`) baseada no Faker, sem depender de contas partilhadas que podem ser bloqueadas ou alteradas
- **Fixtures para partilhar estado entre steps**: cada cenário recebe o seu próprio contexto isolado, seguro em execução paralela
- **Sincronização sem esperas fixas**: os testes esperam por sinais concretos (respostas da API, indicadores de carregamento, elementos visíveis), nunca por tempo
- **Regras de negócio respeitadas**: a morada do registo é a devolvida pela procura do código postal, tal como acontece com um utilizador real
- **Page Object Model (POM)**: cada página do site tem a sua classe com elementos e ações
- **Localizadores por test id**: uso de `getByTestId()` com o atributo `data-test` configurado em `testIdAttribute`
- **Tags para controlar a execução**: `@sem-ci` (só local) e `@wip` (trabalho em curso)
- **Evidências automáticas em caso de falha**: screenshot, vídeo e trace
- **Integração Contínua (CI)**: os cenários correm automaticamente no GitHub Actions a cada push

> ℹ️ Cenários marcados com `@sem-ci` correm apenas localmente: o site usa proteção anti-bot (Cloudflare) nas áreas de conta para tráfego vindo de datacenters, como o GitHub Actions. Num projeto real, o CI correria contra um ambiente de testes sem essa proteção.

## 📁 Estrutura do projeto

```
├── .github/workflows/      # Pipeline de CI (GitHub Actions)
├── features/               # Cenários funcionais em Gherkin
│   ├── login.feature
│   ├── pesquisa.feature
│   └── registo.feature
├── steps/                  # Step definitions (ligação Gherkin → código)
│   ├── fixtures.ts         # Contexto partilhado entre steps de um cenário
│   ├── conta.steps.ts
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
npm test -- --grep "Registo"            # Só os cenários com "Registo" no nome
```

> ℹ️ O comando `bddgen` gera os testes Playwright a partir dos ficheiros `.feature` (na pasta `.features-gen`, ignorada pelo Git). Os atalhos `npm test` e `npm run test:ui` já o executam automaticamente.

## 👤 Autor

**Arthur Evangelista**
