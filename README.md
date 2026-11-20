# 🎭 Projeto Toolshop – Testes E2E

Testes automatizados de ponta a ponta (E2E) da loja **Toolshop** ([Practice Software Testing](https://practicesoftwaretesting.com)), escritos em **Gherkin em português** e executados com **Playwright + playwright-bdd + TypeScript**.

[![Testes E2E](https://github.com/evangelistaaj/Projeto-toolshop/actions/workflows/playwright.yml/badge.svg)](https://github.com/evangelistaaj/Projeto-toolshop/actions/workflows/playwright.yml)
![Estado](https://img.shields.io/badge/estado-em%20constru%C3%A7%C3%A3o-yellow)
![Node](https://img.shields.io/badge/node-26-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-7-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-1.64-2EAD33?logo=playwright&logoColor=white)

> **Em resumo:** testes E2E de uma loja online, escritos primeiro como cenários funcionais em **Gherkin (português)** e automatizados com **Playwright + TypeScript**. Destaques: Page Object Model, dados de teste gerados com **Faker**, preparação de dados pela **API**, sincronização sem esperas fixas, uma **instância local da loja em Docker**, CI no **GitHub Actions** e bugs documentados como cenários executáveis.
>
> 🇬🇧 **In short:** E2E test suite for an e-commerce demo app, written first as functional scenarios in Gherkin (Portuguese) and automated with Playwright + TypeScript, using the Page Object Model, Faker-generated test data, API-based test data setup, wait-free synchronization, a local Docker instance of the app and GitHub Actions CI. Known bugs are kept as executable scenarios.

> 🚧 **Projeto em construção.** Este README acompanha o estado real do repositório: só descreve o que já está feito.

---

## 📌 Sobre o projeto

Este repositório é a primeira parte do meu portfolio de automação de testes:

| Projeto | O que testa | Stack |
|---|---|---|
| **Projeto-toolshop** (este) | Interface (E2E) | Playwright + playwright-bdd |
| [Projeto-toolshop-api](https://github.com/evangelistaaj/Projeto-toolshop-api) | API REST | Playwright (`APIRequestContext`) + Cucumber |

Os cenários são escritos primeiro como **testes funcionais em Gherkin (português)** e depois ligados à automação, seguindo o fluxo: **cenário funcional → step definitions → Page Objects**.

---

## 🛠️ Tecnologias

| Ferramenta | Versão | Para que serve |
|---|---|---|
| [Node.js](https://nodejs.org) | 26 | Ambiente de execução |
| [@playwright/test](https://playwright.dev) | 1.64 | Executa os testes nos browsers (Chromium, Firefox e WebKit) |
| [playwright-bdd](https://github.com/vitalets/playwright-bdd) | 9.2 | Gera testes do Playwright a partir dos `.feature` |
| [Faker](https://fakerjs.dev) | 10.6 | Dados de teste realistas, em português de Portugal |
| [TypeScript](https://www.typescriptlang.org) | 7.0 | Linguagem dos passos e dos Page Objects |
| [Docker](https://www.docker.com) | — | Instância local da Toolshop |

---

## 🚀 Como executar

**Pré-requisitos:** Node.js 26 ou superior e Git. Para correr todos os cenários, a Toolshop a correr localmente com Docker ([instruções no repositório original](https://github.com/testsmith-io/practice-software-testing)).

```bash
git clone https://github.com/evangelistaaj/Projeto-toolshop.git
cd Projeto-toolshop
npm install
npx playwright install
npm test
```

A versão do Node.js está em `.nvmrc` e no campo `engines` do `package.json`.

### ⏯️ Comandos

| Comando | O que faz |
|---|---|
| `npm test` | Gera os testes a partir dos `.feature` (`bddgen`) e corre todos, nos 3 browsers |
| `npm run test:ui` | Modo interativo do Playwright |
| `npm run relatorio` | Abre o relatório HTML da última execução (não abre sozinho no fim dos testes) |
| `npm run typecheck` | Verifica os tipos do TypeScript em todo o projeto, sem correr os testes |
| `npm test -- checkout` | Só uma funcionalidade |
| `npm test -- --project=chromium` | Só no Chromium |
| `npm test -- --grep "@convidado"` | Só os cenários com uma tag |
| `npm test -- --grep "preço"` | Só os cenários com "preço" no nome |
| `npm test -- --headed` / `--debug` | Mostrar o browser / depurar passo a passo |

> ℹ️ O `bddgen` gera os testes Playwright a partir dos ficheiros `.feature`, na pasta `.features-gen` (ignorada pelo Git). Os comandos `npm test` e `npm run test:ui` já o executam.

### 🐳 Correr contra a Toolshop local (Docker)

Por omissão, os testes correm contra o site público, que é partilhado e bloqueia quem cria muitas contas ou falha muitos logins. Para correr tudo (incluindo os cenários `@sem-ci` e `@so-local`), use uma instância local da Toolshop:

```powershell
# Na pasta do repositório da aplicação
docker compose -f docker-compose.prod.yml up --pull missing -d

# Neste projeto (PowerShell)
$env:BASE_URL="http://localhost:4200"
npm test
```

Com o `BASE_URL` em `localhost`, a configuração ajusta-se sozinha: corre os cenários `@so-local`, usa menos testes em paralelo e dá mais tempo a cada teste, porque o mesmo computador corre os browsers e a loja.

### 🤖 Integração contínua

A cada `push` para o `main` (e em cada pull request), o GitHub Actions (`.github/workflows/playwright.yml`) instala as dependências e os browsers, corre os cenários contra o site público e publica o relatório HTML como artefacto (`playwright-report`). Também pode ser corrida à mão, no separador **Actions**.

> ℹ️ Os cenários `@sem-ci` e `@so-local` ficam de fora da CI: o site público usa proteção anti-bot (Cloudflare) nas áreas de conta para tráfego vindo de datacenters, como o GitHub Actions, e não se criam dados num ambiente partilhado. Num projeto real, a CI correria contra um ambiente de testes sem essa proteção.

---

## 📝 Exemplo de cenário

```gherkin
# language: pt
@slow @sem-ci
Funcionalidade: Checkout
  Como cliente da Toolshop
  Quero finalizar a compra dos produtos do meu carrinho
  Para receber as ferramentas que escolhi

  Contexto:
    Dado que o produto "Combination Pliers" tem stock
    E que tenho o produto "Combination Pliers" no carrinho

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
```

---

## 📊 Estado atual

| Execuções de cenários | Testes (× 3 browsers) | A passar ✅ | A reproduzir um bug 🐞 | Na CI (site público) | Bugs e dúvidas (issues) |
|---|---|---|---|---|---|
| 50 | 150 | 144 | 6 | 60 | 5 |

> Um esquema de cenário conta uma execução por exemplo, e cada execução corre em Chromium, Firefox e WebKit. As 2 execuções que reproduzem bugs (#4 e #5) estão marcadas com `@bug @fail`: o Playwright conta-as como esperadas enquanto o bug existir e avisa quando deixarem de falhar.

**O que já é verificado**

| Funcionalidade | Cenário | Verificações |
|---|---|---|
| Registo | Registo com dados válidos (gerados com o Faker) | A morada é a sugerida pelo código postal; depois do registo, a página de login |
| Login | Login com uma conta acabada de criar | A página "My account" |
| Login | Utilizador inexistente | A mensagem "Invalid email or password" |
| Login (local) | Password errada | A mesma mensagem: não revela que a conta existe |
| Login (local) | Três tentativas falhadas | Mesmo com a password certa, a mensagem de conta bloqueada |
| Pesquisa | Pesquisar `pliers`, `hammer` e `saw` | Todos os resultados contêm o termo (sem distinguir maiúsculas) |
| Pesquisa | Pesquisar um produto que não existe | A mensagem de que não existem produtos |
| Filtros | Categorias "Pliers" e "Other" (páginas 1 e 2) | A **lista exata** de produtos de cada página, depois de ordenar por nome |
| Filtros | Preço: 0–200, 0–10, 10–50, 50–100, 100–200 (partições e limites) | Todos os resultados dentro do intervalo, com limites inclusivos |
| Filtros | Preço entre 190 e 200 (intervalo sem produtos) | A mensagem de que não existem produtos |
| Ordenação | Nome e preço, crescente e decrescente | A lista aparece na ordem pedida |
| Carrinho | Alterar a quantidade para 3 | O total é 3 × o preço mostrado (contas em cêntimos) |
| Carrinho | Remover o único produto | O carrinho fica vazio |
| Checkout (com conta) | Comprar com pagamento na entrega | A confirmação tem um número de fatura, e essa fatura aparece em "My invoices" |
| Checkout (convidado) | Comprar com cada método de pagamento e a prestações (3, 6, 9 e 12 meses) | A confirmação tem um número de fatura |
| Checkout (convidado) | Depois de finalizar a compra | O carrinho fica vazio |
| Checkout (dados inválidos) | Email do convidado inválido; morada sem rua; cartão com número incompleto, validade no passado ou CVV de 2 algarismos | O aviso certo, e não se consegue avançar ou confirmar (cada exemplo muda **um** só campo) |
| Checkout 🐞 | Encomenda recusada pela API (cidade que não corresponde ao código postal) | O cliente é avisado — **falha: o ecrã não mostra nada** (bug [#4](https://github.com/evangelistaaj/Projeto-toolshop/issues/4)) |
| Desconto ecológico (local) | Maioria das unidades ecológicas | O carrinho mostra 5% de desconto, o subtotal e o total certos |
| Desconto ecológico (local) | Exatamente metade (limite) | Sem desconto |
| Desconto ecológico (local) | Mudar a quantidade até a maioria ser ecológica | O desconto aparece |
| Desconto ecológico (local) | O cliente paga o total que viu no carrinho (controlo: 3 × 9.99) | O total da fatura em "My invoices" é o do carrinho |
| Desconto ecológico (local) 🐞 | O mesmo, com 1 × 10.10 | **Falha: o carrinho mostra $9.59 e a fatura cobra $9.60** (bug [#5](https://github.com/evangelistaaj/Projeto-toolshop/issues/5)) |
| Selo "ECO" (local) | Classificação CO₂ A, B, C e E | O selo aparece com A e B, e não aparece com C nem com E (os limites da regra) |

> Os cenários marcados com "(local)" criam produtos ou provocam bloqueios de conta, e só correm na Toolshop local (tag `@so-local`).

---

## 🧱 Boas práticas e decisões

**Desenho dos cenários**
- **BDD com Gherkin**: cenários legíveis para toda a equipa (QA, PO, desenvolvimento), que servem ao mesmo tempo de documentação e de testes executáveis
- **Cenários declarativos**, com **um comportamento por cenário**
- **Linguagem de negócio nos cenários**: valores técnicos (como `name,asc`) traduzidos no código através de um dicionário
- **Contexto (Background)** para passos comuns a todos os cenários de uma funcionalidade
- **Regras (`Regra:`) por regra de negócio**: no checkout, cada persona (cliente com conta e convidado), os dados inválidos e o bug conhecido têm o seu bloco, com o seu próprio Contexto e a sua tag
- **Esquema do Cenário** e **tabelas de dados (Data Tables)** para testes orientados a dados, com colunas que servem só para dar um título legível a cada exemplo
- **Técnicas de desenho de testes**: partição de equivalência, análise de valores limite e seleção de casos baseada em risco. Por exemplo, os métodos de pagamento são testados numa só persona, porque a validação do pagamento é igual para as duas; o que muda entre personas (o caminho da fatura) tem um cenário em cada uma
- **Oráculos fortes**: verificação da lista exata de produtos esperados, em vez de heurísticas frágeis; e, depois da compra, verificação das consequências (a fatura com aquele número aparece na conta do cliente), e não só da mensagem de sucesso
- **Cenários negativos com uma só variável**: o cartão é preenchido com dados válidos e depois só **um** campo fica inválido, para se saber exatamente o que causou a recusa
- **Bugs conhecidos como cenários executáveis**: o cenário descreve o comportamento correto e fica marcado com `@fail`; enquanto o bug existir, conta como esperado, e quando for corrigido o Playwright avisa

**Automação**
- **Steps reutilizáveis e organizados por assunto** (navegação, conta, filtros, checkout…), partilhados por todas as funcionalidades
- **Page Object Model (POM)**: cada página do site tem a sua classe com elementos e ações; o checkout é um único Page Object organizado pelas 4 etapas do assistente
- **Localizadores estáveis**: `getByTestId()` com o atributo `data-test`, e localizadores acessíveis (`getByRole`, `getByLabel`) quando não há test id ou quando contém identificadores internos (por exemplo, a linha da fatura pelo número, ou a quantidade pelo rótulo "Quantity for <produto>"); CSS só como exceção comentada
- **Interação acessível com componentes complexos**: o slider de preço é controlado por teclado (Home/End, Page Up/Down, setas), sem depender de posições em píxeis
- **`baseURL` configurado**: o endereço do site está definido num único sítio, e o mesmo código corre no site público ou na instância local
- **Verificação de tipos**: `npm run typecheck` confirma o projeto inteiro antes de correr os testes

**Dados e estabilidade**
- **Isolamento de dados de teste**: cada cenário cria os seus próprios dados com fábricas (`utils/dados.ts`) baseadas no Faker, sem depender de contas partilhadas
- **Dados de pagamento válidos por construção**: os geradores de transferência bancária, cartão de crédito e cartão de presente seguem as regras de validação da aplicação (formatos, tamanhos, validade sempre no futuro, nomes sem acentos)
- **Preparação de dados pela API**: antes de cada compra, o stock do produto é reposto através da API (só na instância local; no site público, partilhado, apenas se confirma que há stock)
- **Fixtures para partilhar estado entre steps**: cada cenário recebe o seu próprio contexto isolado, seguro em execução paralela (por exemplo, o número da fatura visto na confirmação é guardado e usado mais tarde, na página das faturas)
- **Sincronização sem esperas fixas**: cada ação que recarrega dados espera pela resposta da API antes de o teste continuar
- **Esperar pelo resultado, não por um acontecimento**: na morada do checkout, o teste repete a verificação até o formulário ficar completo e estável, em vez de esperar por um pedido à API que pode não acontecer
- **Falhar depressa e com mensagens claras**: cada ação desiste ao fim de 15 s, e as asserções explicam o que falhou (por exemplo, "o produto tem stock?")
- **Comportamento real do utilizador**: no registo e no checkout, a rua e a cidade são as sugeridas pela procura do código postal, tal como faria um utilizador real

**Execução e evidências**
- **Tags para controlar a execução**:
  - `@sem-ci`: só corre localmente (cria contas ou encomendas)
  - `@so-local`: só corre na instância local (provoca falhas de login e bloqueios de conta, ou cria produtos no catálogo)
  - `@slow`: dá o triplo do tempo a fluxos longos, como o checkout
  - `@com-conta` e `@convidado`: permitem correr só uma persona do checkout
  - `@negativo`: cenários de dados inválidos
  - `@bug` e `@fail`: bug conhecido, documentado como cenário que deve falhar enquanto o bug existir
  - `@wip`: trabalho em curso, nunca corre
- **Evidências automáticas em caso de falha**: screenshot, vídeo e trace
- **Integração Contínua (CI)**: os cenários correm automaticamente no GitHub Actions a cada push

---

## 🐞 Bugs encontrados

| # | Bug | Severidade | Estado |
|---|---|---|---|
| [#1](https://github.com/evangelistaaj/Projeto-toolshop/issues/1) | O filtro de preço mostra **resultados desatualizados** quando o intervalo muda várias vezes seguidas (as respostas chegam fora de ordem) | 🟠 Média (intermitente) | Aberto |
| [#2](https://github.com/evangelistaaj/Projeto-toolshop/issues/2) | Registo: o **distrito** preenchido pelo utilizador é **apagado** por uma procura de morada atrasada (a procura é feita duas vezes). O checkout tem o mesmo comportamento | 🟠 Média (intermitente) | Aberto |
| [#3](https://github.com/evangelistaaj/Projeto-toolshop/issues/3) | Registo: o servidor aceita um **distrito incoerente com a cidade** (ex.: *Amora* com o distrito *Porto*) | 🟡 Baixa (dúvida: a validação é esperada?) | Aberto |
| [#4](https://github.com/evangelistaaj/Projeto-toolshop/issues/4) | Checkout: quando a API recusa a encomenda (422), o ecrã **não mostra nenhum aviso**, e o cliente pensa que comprou | 🔴 Alta | Aberto |
| [#5](https://github.com/evangelistaaj/Projeto-toolshop/issues/5) | Desconto ecológico: o carrinho mostra **$9.59** e a fatura cobra **$9.60** (cada lado arredonda à sua maneira; o lado da API é o [#13 do projeto da API](https://github.com/evangelistaaj/Projeto-toolshop-api/issues/13)) | 🟡 Baixa | Aberto |

Os bugs com cenário executável estão marcados com `@bug @fail`: o cenário descreve o comportamento correto e falha enquanto o bug existir. Quando o bug for corrigido, o Playwright avisa, e é altura de tirar o `@fail`. Os bugs #1 e #2 são intermitentes: os testes contornam-nos (cada ação espera pela sua resposta), com um comentário e o link do issue no código.

## 🔍 Descobertas

Observações sobre a aplicação que não são bugs (ou que já estão registadas noutro sítio), encontradas ao investigar falhas dos testes:

- **Selo "ECO" no título do produto**: nos produtos com classificação CO₂ A ou B, o título da página do produto inclui o selo "ECO". Um teste que compare o nome exato falha; o teste procura o nome (único) dentro do título. O selo tem um cenário próprio, com os limites A/B (mostra) e C/E (não mostra).
- **Botão de remover sem nome acessível**: no carrinho, o botão que remove um produto é só um ícone "x", sem texto, rótulo nem `data-test`. Um leitor de ecrã não o anuncia, e o teste tem de o encontrar por CSS.
- **Formato inconsistente do número da fatura**: as faturas novas têm um algarismo a menos do que as que já existiam (`INV-2026000120` e `INV-20260000034`). Está registado como bug no projeto da API ([#8](https://github.com/evangelistaaj/Projeto-toolshop-api/issues/8)).
- **Confirmação em dois cliques**: no checkout, o botão "Confirm" valida primeiro o pagamento e só no segundo clique cria a encomenda. Parecia uma submissão duplicada, mas o código da aplicação mostra que é intencional.
- **Stock que se esgota**: cada execução do checkout compra uma unidade, e com execuções repetidas o produto esgota (o botão "Add to cart" fica desligado). A solução foi repor o stock pela API antes de cada compra; o campo `stock` é aceite pela API, apesar de não aparecer na documentação (Swagger).
- **Bloqueio de contas partilhadas**: as contas de demonstração ficam bloqueadas após várias tentativas de login falhadas, o que motivou a criação de utilizadores próprios em cada cenário.
- **Categorias vs. nomes de produtos**: alguns produtos pertencem a uma categoria sem a incluírem no nome (por exemplo, *Bolt Cutters* em *Pliers*), o que tornou necessária a validação pela lista exata de produtos.
- **Valores limite sem resultados**: não existem produtos no intervalo de preço entre 190 e 200, um caso coberto por um cenário próprio.

---

## 📂 Estrutura

```
├── .github/workflows/      # Pipeline de CI (GitHub Actions)
├── features/               # Cenários funcionais em Gherkin
│   ├── carrinho.feature
│   ├── checkout.feature
│   ├── desconto-ecologico.feature
│   ├── filtros.feature
│   ├── login.feature
│   ├── pesquisa.feature
│   └── registo.feature
├── steps/                  # Step definitions (ligação Gherkin → código)
│   ├── fixtures.ts         # Contexto partilhado entre steps de um cenário
│   ├── navegacao.steps.ts  # Passos de navegação comuns
│   ├── conta.steps.ts      # Registar e usar uma conta
│   ├── carrinho.steps.ts
│   ├── checkout.steps.ts
│   ├── desconto-ecologico.steps.ts
│   ├── filtros.steps.ts
│   ├── login.steps.ts
│   ├── pesquisa.steps.ts
│   ├── registo.steps.ts
│   └── stock.steps.ts      # Pré-condição de stock (preparação pela API)
├── pages/                  # Page Objects
│   ├── AccountPage.ts
│   ├── CheckoutPage.ts     # As 4 etapas do checkout (a 1.ª é o carrinho)
│   ├── HomePage.ts
│   ├── InvoicesPage.ts     # As faturas do cliente ("My invoices")
│   ├── LoginPage.ts
│   ├── ProductPage.ts
│   └── RegisterPage.ts
├── utils/
│   ├── dados.ts            # Fábricas de dados de teste (Faker): utilizador e pagamentos
│   ├── produtos.ts         # Produtos de teste criados e apagados pela API (só na Toolshop local)
│   └── stock.ts            # Reposição de stock pela API
├── .nvmrc                  # Versão do Node.js
├── CLAUDE.md               # Convenções do projeto (para o assistente Claude)
├── playwright.config.ts    # Configuração do Playwright e do playwright-bdd
└── tsconfig.json           # Configuração do TypeScript
```

---

## 🗺️ Plano

- [x] Registo e login (incluindo o bloqueio de conta)
- [x] Pesquisa, filtros, ordenação e paginação
- [x] Carrinho
- [x] Checkout, com conta e como convidado, com todos os métodos de pagamento
- [x] Desconto ecológico e selo "ECO", com produtos criados pela API
- [x] Bugs conhecidos como cenários executáveis
- [x] Integração contínua (GitHub Actions)

### 💡 Próximos passos

- Massa de teste em ficheiros JSON (como no projeto da API)
- Ordenação por classificação CO₂
- Mensagens de falha mais legíveis no terminal
- Testes de carga com k6, contra a instância local da Toolshop em Docker

---

## 👤 Autor

**Arthur Evangelista** · [GitHub](https://github.com/evangelistaaj)
