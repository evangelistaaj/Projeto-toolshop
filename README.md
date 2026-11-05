# 🎭 Testes Automatizados com Playwright + BDD – Toolshop

![Playwright Tests](https://github.com/evangelistaaj/playwright-toolshop/actions/workflows/playwright.yml/badge.svg)

Projeto de automação de testes end-to-end (E2E) da aplicação de e-commerce [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com/), desenvolvido com **Playwright**, **TypeScript** e **BDD (Gherkin)**.

Os cenários são escritos primeiro como **testes funcionais em Gherkin (português)** e depois ligados à automação, seguindo o fluxo: **cenário funcional → step definitions → Page Objects**.

> 🚧 Projeto em desenvolvimento: novos cenários são adicionados regularmente.

## 🛠️ Tecnologias

- [Playwright](https://playwright.dev/) – framework de testes E2E
- [playwright-bdd](https://github.com/vitalets/playwright-bdd) – execução de cenários Gherkin com o Playwright
- Gherkin (em português)
- TypeScript
- Node.js
- Git e GitHub Actions

## 📝 Exemplo de cenário

```gherkin
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
```

## ✅ Cenários testados

**Login** (`features/login.feature`)
- Login com utilizador válido (redireciona para a área de cliente)
- Login com password errada (mensagem de erro)

**Pesquisa de produtos** (`features/pesquisa.feature`)
- Pesquisa por produto existente, validando que todos os resultados contêm o termo pesquisado (Esquema do Cenário com 3 exemplos)

**Próximos cenários**
- Pesquisa sem resultados
- Filtros por categoria
- Carrinho e checkout

Todos os cenários correm em **3 browsers**: Chromium, Firefox e WebKit.

## 🧱 Boas práticas aplicadas

- **BDD com Gherkin**: cenários legíveis para toda a equipa (QA, PO, desenvolvimento), que servem ao mesmo tempo de documentação e de testes executáveis
- **Cenários declarativos**: descrevem o que o utilizador faz, não os detalhes do ecrã
- **Steps reutilizáveis**: frases parametrizadas com `{string}`, usadas em vários cenários sem código novo
- **Esquema do Cenário**: testes orientados a dados com tabelas de Exemplos
- **Page Object Model (POM)**: cada página do site tem a sua classe com elementos e ações
- **Localizadores por test id**: uso de `getByTestId()` com o atributo `data-test` configurado em `testIdAttribute`
- **`baseURL` configurado**: o endereço do site está definido num único sítio
- **Testes independentes, positivos e negativos**
- **Evidências automáticas em caso de falha**: screenshot, vídeo e trace
- **Integração Contínua (CI)**: os cenários correm automaticamente no GitHub Actions a cada push

## 📁 Estrutura do projeto

```
├── .github/workflows/      # Pipeline de CI (GitHub Actions)
├── features/               # Cenários funcionais em Gherkin
│   ├── login.feature
│   └── pesquisa.feature
├── steps/                  # Step definitions (ligação Gherkin → código)
│   ├── login.steps.ts
│   └── pesquisa.steps.ts
├── pages/                  # Page Objects
│   ├── LoginPage.ts
│   ├── AccountPage.ts
│   └── HomePage.ts
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
npm run test:ui                     # Modo interativo
npm test -- --project=chromium      # Só no Chromium
npm test -- --headed                # Mostrar o browser
```

> ℹ️ O comando `bddgen` gera os testes Playwright a partir dos ficheiros `.feature` (na pasta `.features-gen`, ignorada pelo Git). Os atalhos `npm test` e `npm run test:ui` já o executam automaticamente.

## 👤 Autor

**Arthur Evangelista**
