# 🎭 Testes Automatizados com Playwright – Toolshop

![Playwright Tests](https://github.com/evangelistaaj/playwright-toolshop/actions/workflows/playwright.yml/badge.svg)

Projeto de automação de testes end-to-end (E2E) da aplicação de e-commerce [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com/), desenvolvido com **Playwright** e **TypeScript**.

> 🚧 Projeto em desenvolvimento: novos cenários são adicionados regularmente.

## 🛠️ Tecnologias

- [Playwright](https://playwright.dev/) – framework de testes E2E
- TypeScript
- Node.js
- Git e GitHub Actions

## ✅ Cenários testados

**Login**
- Login com utilizador válido (redireciona para a área de cliente)
- Login com password errada (mensagem de erro)

**Próximos cenários**
- Pesquisa de produtos
- Filtros por categoria
- Carrinho e checkout

Todos os testes correm em **3 browsers**: Chromium, Firefox e WebKit.

## 🧱 Boas práticas aplicadas

- **Page Object Model (POM)**: cada página do site tem a sua classe com elementos e ações, separando a lógica dos testes da estrutura das páginas
- **Localizadores por test id**: uso de `getByTestId()` com o atributo `data-test` configurado em `testIdAttribute`
- **`baseURL` configurado**: o endereço do site está definido num único sítio
- **Testes independentes, positivos e negativos**
- **Evidências automáticas em caso de falha**: screenshot, vídeo e trace
- **Integração Contínua (CI)**: os testes correm automaticamente no GitHub Actions a cada push

## 📁 Estrutura do projeto

```
├── .github/workflows/      # Pipeline de CI (GitHub Actions)
├── pages/                  # Page Objects
│   ├── LoginPage.ts
│   └── AccountPage.ts
├── tests/                  # Testes
│   └── login.spec.ts
├── playwright.config.ts    # Configuração do Playwright
└── tsconfig.json           # Configuração do TypeScript
```

## ▶️ Como executar

**Pré-requisito:** [Node.js](https://nodejs.org/) (versão LTS)

```bash
# 1. Instalar as dependências
npm install

# 2. Instalar os browsers do Playwright
npx playwright install

# 3. Correr todos os testes
npx playwright test

# 4. Abrir o relatório
npx playwright show-report
```

Outros comandos úteis:

```bash
npx playwright test --ui                  # Modo interativo
npx playwright test --project=chromium    # Só no Chromium
npx playwright test --headed              # Mostrar o browser
```

## 👤 Autor

**Arthur Evangelista**
