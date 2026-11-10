# 🎭 Testes Automatizados com Playwright + BDD – Toolshop

![Playwright Tests](https://github.com/evangelistaaj/Projeto-toolshop/actions/workflows/playwright.yml/badge.svg)

> **Em resumo:** testes E2E de uma loja online, escritos primeiro como cenários funcionais em **Gherkin (português)** e automatizados com **Playwright + TypeScript**. Destaques: Page Object Model, dados de teste gerados com **Faker**, preparação de dados pela **API**, sincronização sem esperas fixas, uma **instância local da loja em Docker**, CI no **GitHub Actions** e uma secção de [descobertas](#-descobertas-durante-a-automação) feitas ao investigar falhas.
>
> 🇬🇧 **In short:** E2E test suite for an e-commerce demo app, written first as functional scenarios in Gherkin (Portuguese) and automated with Playwright + TypeScript, using the Page Object Model, Faker-generated test data, API-based test data setup, wait-free synchronization, a local Docker instance of the app and GitHub Actions CI.

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
- Docker (instância local do Toolshop)
- Git e GitHub Actions

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

## ✅ Cenários testados

**Registo de utilizador** (`features/registo.feature`)
- Registo com dados válidos gerados aleatoriamente, com morada preenchida a partir do código postal

**Login** (`features/login.feature`)
- Login com uma conta acabada de criar
- Login com utilizador inexistente (mensagem de erro)
- Login com password errada
- Conta bloqueada após 3 tentativas falhadas

**Pesquisa de produtos** (`features/pesquisa.feature`)
- Pesquisa por produto existente, validando que todos os resultados contêm o termo pesquisado
- Pesquisa por produto inexistente (mensagem de que não existem produtos)

**Filtros, ordenação e paginação** (`features/filtros.feature`)
- Filtro por intervalo de preço, com partições de equivalência e valores limite (incluindo um intervalo sem produtos)
- Ordenação por nome e por preço, crescente e decrescente
- Filtro por categoria, validando a lista exata de produtos esperados
- Paginação de resultados filtrados

**Checkout** (`features/checkout.feature`), organizado por persona com `Regra:`
- **Cliente com conta:** compra depois de iniciar sessão no checkout
- **Convidado:** compra com cada método de pagamento (pagamento na entrega, transferência bancária, cartão de crédito e cartão de presente)
- **Convidado:** compra a prestações, com todas as opções (3, 6, 9 e 12 meses)

**Próximos passos**
- Checkout: cenários negativos (dados de pagamento inválidos, morada incompleta)
- Checkout: regras depois da compra (carrinho vazio, fatura visível na conta do cliente)
- Ordenação por classificação CO₂
- Massa de teste em ficheiros JSON
- Testes de carga com k6, contra a instância local do Toolshop em Docker

Todos os cenários correm em **3 browsers**: Chromium, Firefox e WebKit.

## 🧱 Boas práticas aplicadas

**Desenho dos cenários**
- **BDD com Gherkin**: cenários legíveis para toda a equipa (QA, PO, desenvolvimento), que servem ao mesmo tempo de documentação e de testes executáveis
- **Cenários declarativos**, com **um comportamento por cenário**
- **Linguagem de negócio nos cenários**: valores técnicos (como `name,asc`) traduzidos no código através de um dicionário
- **Contexto (Background)** para passos comuns a todos os cenários de uma funcionalidade
- **Regras (`Regra:`) por persona**: no checkout, cada persona (cliente com conta e convidado) tem o seu bloco, com o seu próprio Contexto e a sua tag
- **Esquema do Cenário** e **tabelas de dados (Data Tables)** para testes orientados a dados, com colunas que servem só para dar um título legível a cada exemplo
- **Técnicas de desenho de testes**: partição de equivalência, análise de valores limite e seleção de casos baseada em risco. Por exemplo, os métodos de pagamento são testados numa só persona, porque a validação do pagamento é igual para as duas; o que muda entre personas (o caminho da fatura) tem um cenário em cada uma
- **Oráculos fortes**: verificação da lista exata de produtos esperados, em vez de heurísticas frágeis

**Automação**
- **Steps reutilizáveis e organizados por assunto** (navegação, conta, filtros, checkout…), partilhados por todas as funcionalidades
- **Page Object Model (POM)**: cada página do site tem a sua classe com elementos e ações; o checkout é um único Page Object organizado pelas 4 etapas do assistente
- **Localizadores estáveis**: `getByTestId()` com o atributo `data-test`, e localizadores acessíveis (`getByRole`, `getByLabel`) quando os test ids contêm identificadores internos
- **Interação acessível com componentes complexos**: o slider de preço é controlado por teclado (Home/End, Page Up/Down, setas), sem depender de posições em píxeis
- **`baseURL` configurado**: o endereço do site está definido num único sítio, e o mesmo código corre no site público ou na instância local
- **Verificação de tipos**: `npx tsc --noEmit` confirma o projeto inteiro antes de correr os testes

**Dados e estabilidade**
- **Isolamento de dados de teste**: cada cenário cria os seus próprios dados com fábricas (`utils/dados.ts`) baseadas no Faker, sem depender de contas partilhadas
- **Dados de pagamento válidos por construção**: os geradores de transferência bancária, cartão de crédito e cartão de presente seguem as regras de validação da aplicação (formatos, tamanhos, validade sempre no futuro, nomes sem acentos)
- **Preparação de dados pela API**: antes de cada compra, o stock do produto é reposto através da API (só na instância local; no site público, partilhado, apenas se confirma que há stock)
- **Fixtures para partilhar estado entre steps**: cada cenário recebe o seu próprio contexto isolado, seguro em execução paralela
- **Sincronização sem esperas fixas**: cada ação que recarrega dados espera pela resposta da API antes de o teste continuar
- **Esperar pelo resultado, não por um acontecimento**: na morada do checkout, o teste repete a verificação até o formulário ficar completo e estável, em vez de esperar por um pedido à API que pode não acontecer
- **Falhar depressa e com mensagens claras**: cada ação desiste ao fim de 15 s, e as asserções explicam o que falhou (por exemplo, "o produto tem stock?")
- **Comportamento real do utilizador**: no registo e no checkout, a rua e a cidade são as sugeridas pela procura do código postal, tal como faria um utilizador real

**Execução e evidências**
- **Tags para controlar a execução**:
  - `@sem-ci`: só corre localmente (cria contas ou encomendas)
  - `@so-local`: só corre na instância local (provoca falhas de login e bloqueios de conta)
  - `@slow`: dá o triplo do tempo a fluxos longos, como o checkout
  - `@com-conta` e `@convidado`: permitem correr só uma persona do checkout
  - `@wip`: trabalho em curso, nunca corre
- **Evidências automáticas em caso de falha**: screenshot, vídeo e trace
- **Integração Contínua (CI)**: os cenários correm automaticamente no GitHub Actions a cada push

> ℹ️ Cenários marcados com `@sem-ci` correm apenas localmente: o site usa proteção anti-bot (Cloudflare) nas áreas de conta para tráfego vindo de datacenters, como o GitHub Actions. Num projeto real, o CI correria contra um ambiente de testes sem essa proteção.

## 🔍 Descobertas durante a automação

Algumas observações sobre o comportamento da aplicação, encontradas ao investigar falhas dos testes. As que podem ser defeitos foram registadas como Issues, com passos para reproduzir e evidências.

- **Resultados de filtro desatualizados** ([bug #1](https://github.com/evangelistaaj/Projeto-toolshop/issues/1)): quando o filtro de preço muda várias vezes seguidas (por exemplo, com o teclado), as respostas da API podem chegar fora de ordem e a lista mostra produtos que não correspondem ao filtro visível. Os testes contornam isto esperando por cada resposta antes da ação seguinte.
- **Procura de morada duplicada** ([bug #2](https://github.com/evangelistaaj/Projeto-toolshop/issues/2)): o formulário de registo faz a procura do código postal duas vezes, e uma resposta atrasada pode apagar o distrito já preenchido pelo utilizador. O checkout tem o mesmo comportamento: a procura dispara 300 ms depois de mudar o código postal ou o número da porta, e uma vez por cada um desses campos.
- **Distrito sem validação** ([questão #3](https://github.com/evangelistaaj/Projeto-toolshop/issues/3)): a procura do código postal preenche a rua e a cidade, mas não o distrito. Num teste manual, o servidor aceitou um distrito incoerente com a cidade (por exemplo, *Amora* com o distrito *Porto*). Fica a questão sobre se esta validação é esperada.
- **Encomenda recusada sem aviso ao cliente** (a registar como issue): no último passo do checkout, a API recusa a fatura (erro 422) e o ecrã fica parado no botão "Confirm", sem nenhuma mensagem. Acontece em dois casos:
  - quando o distrito foi apagado pela procura de morada (ver bug #2);
  - quando a cidade não é a que a procura devolve para aquele código postal. Aqui, a mensagem da API ainda engana: diz que o país não corresponde à morada, quando o problema é a cidade, e o campo cidade aceita qualquer texto.
- **Confirmação em dois cliques**: no checkout, o botão "Confirm" valida primeiro o pagamento e só no segundo clique cria a encomenda. Parecia uma submissão duplicada, mas o código da aplicação mostra que é intencional.
- **Stock que se esgota**: cada execução do checkout compra uma unidade, e com execuções repetidas o produto esgota (o botão "Add to cart" fica desligado). A solução foi repor o stock pela API antes de cada compra; o campo `stock` é aceite pela API, apesar de não aparecer na documentação (Swagger).
- **Bloqueio de contas partilhadas**: as contas de demonstração ficam bloqueadas após várias tentativas de login falhadas, o que motivou a criação de utilizadores próprios em cada cenário.
- **Categorias vs. nomes de produtos**: alguns produtos pertencem a uma categoria sem a incluírem no nome (por exemplo, *Bolt Cutters* em *Pliers*), o que tornou necessária a validação pela lista exata de produtos.
- **Valores limite sem resultados**: não existem produtos no intervalo de preço entre 190 e 200, um caso coberto por um cenário próprio.

## 📁 Estrutura do projeto

```
├── .github/workflows/      # Pipeline de CI (GitHub Actions)
├── features/               # Cenários funcionais em Gherkin
│   ├── checkout.feature
│   ├── filtros.feature
│   ├── login.feature
│   ├── pesquisa.feature
│   └── registo.feature
├── steps/                  # Step definitions (ligação Gherkin → código)
│   ├── fixtures.ts         # Contexto partilhado entre steps de um cenário
│   ├── navegacao.steps.ts  # Passos de navegação comuns
│   ├── conta.steps.ts      # Registar e usar uma conta
│   ├── checkout.steps.ts
│   ├── filtros.steps.ts
│   ├── login.steps.ts
│   ├── pesquisa.steps.ts
│   ├── registo.steps.ts
│   └── stock.steps.ts      # Pré-condição de stock (preparação pela API)
├── pages/                  # Page Objects
│   ├── AccountPage.ts
│   ├── CheckoutPage.ts     # As 4 etapas do checkout
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   ├── ProductPage.ts
│   └── RegisterPage.ts
├── utils/
│   ├── dados.ts            # Fábricas de dados de teste (Faker): utilizador e pagamentos
│   └── stock.ts            # Reposição de stock pela API
├── CLAUDE.md               # Convenções do projeto (para o assistente Claude)
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
npm test -- checkout                    # Só uma funcionalidade
npm test -- --grep "@convidado"         # Só os cenários com uma tag
npm test -- --grep "preço"              # Só os cenários com "preço" no nome
npm test -- --headed                    # Mostrar o browser
npm test -- --debug                     # Modo de depuração, passo a passo
npx tsc --noEmit                        # Verificar os tipos do projeto
```

> ℹ️ O comando `bddgen` gera os testes Playwright a partir dos ficheiros `.feature` (na pasta `.features-gen`, ignorada pelo Git). Os atalhos `npm test` e `npm run test:ui` já o executam automaticamente.

### 🐳 Correr contra uma instância local (Docker)

Por omissão, os testes correm contra o site público, que é partilhado e bloqueia quem cria muitas contas ou falha muitos logins. Para correr tudo (incluindo os cenários `@sem-ci` e `@so-local`), use uma instância local do Toolshop com Docker, a partir do [repositório da aplicação](https://github.com/testsmith-io/practice-software-testing):

```powershell
# Na pasta do repositório da aplicação
docker compose -f docker-compose.prod.yml up --pull missing -d

# Neste projeto (PowerShell)
$env:BASE_URL="http://localhost:4200"
npm test
```

Com o `BASE_URL` em `localhost`, a configuração ajusta-se sozinha: corre os cenários `@so-local`, usa menos testes em paralelo e dá mais tempo a cada teste, porque o mesmo computador corre os browsers e a loja.

## 👤 Autor

**Arthur Evangelista**
