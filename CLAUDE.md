# CLAUDE.md: Projeto Toolshop (BDD + Playwright)

Testes automatizados da **Toolshop** (Practice Software Testing), escritos em Gherkin e
automatizados com Playwright, playwright-bdd e TypeScript.

O dono do projeto é QA e está a aprender automação. Por isso:
- Fala sempre em **português europeu (PT-PT)**.
- **Explica o porquê** de cada alteração antes de a fazer, em linguagem simples.
- Faz uma coisa de cada vez e pede confirmação antes de mudanças grandes.
- Quando um teste falhar, investiga primeiro (registos, trace, código) e forma uma hipótese
  antes de mudar código. Nunca enfraqueças uma asserção só para o teste passar.

## Comandos

```powershell
npm test                                   # bddgen + todos os testes (3 browsers)
npm run test:ui                            # modo visual
npm test -- login --project=chromium       # só um ficheiro, só um browser
npm test -- --grep "preço"                 # só cenários com "preço" no nome
npx playwright show-report                 # relatório HTML
```

- Ambiente: Windows, PowerShell e VS Code. Nos comandos, usa `curl.exe` (e não `curl`).
- `bddgen` gera os testes a partir dos `.feature` em `.features-gen/` (ignorada pelo git).

## Ambientes

- **Site público** (por omissão): `https://practicesoftwaretesting.com`. É partilhado: bloqueia
  quem faz muitos registos e logins, e outras pessoas alteram dados. **Não corras lá testes que
  criam contas em ciclo.**
- **Toolshop local** (recomendado para correr tudo): está em `C:\Meus\pst`, com Docker.
  - Arrancar: `docker compose -f docker-compose.prod.yml up --pull missing -d` (em `C:\Meus\pst`)
  - Repor os dados: `docker exec -it pst-laravel-api-1 php artisan migrate:fresh --seed`
  - **Erro 500 na API** depois de arrancar ou repor (ficheiro de registo criado pelo `root`):
    `docker exec -u root pst-laravel-api-1 chown -R www-data:www-data storage bootstrap/cache`
  - UI em `http://localhost:4200`, API em `http://localhost:8091`
  - Testes contra a Toolshop local: `$env:BASE_URL="http://localhost:4200"`, depois `npm test`
- `playwright.config.ts`: com o `BASE_URL` em `localhost`, usa 2 workers e 60 s por teste,
  porque o PC corre os browsers e a loja ao mesmo tempo. Com 6 workers, o filtro de preço
  esgotava o tempo.

## Tags

- `@sem-ci`: cria contas. Fica fora da CI.
- `@so-local`: provoca falhas de login ou bloqueios de conta. Só corre com o `BASE_URL` em `localhost`.
- `@wip`: nunca corre.
- A exclusão é feita no `defineBddConfig` (`playwright.config.ts`). A CI (GitHub Actions)
  corre contra o site público.

## Estrutura e convenções (segue-as; não introduzas outra estrutura)

```
features/   login, registo, pesquisa, filtros (.feature; os filtros incluem a ordenação)
steps/      fixtures.ts, navegacao.steps.ts, conta.steps.ts, login.steps.ts,
            registo.steps.ts, pesquisa.steps.ts, filtros.steps.ts
pages/      HomePage.ts, LoginPage.ts, RegisterPage.ts, AccountPage.ts
utils/      dados.ts (gerarUtilizador() com faker pt_PT)
```

- **Estado entre passos:** fixture `contexto` em `steps/fixtures.ts` (`utilizador`, `faixaPreco`).
  Acrescenta campos aí; nunca uses variáveis globais.
- **Page Objects:** criados dentro de cada passo (`new LoginPage(page)`). Locators `readonly`
  no construtor e métodos em português (`abrir`, `fazerLogin`, `registar`, `pesquisar`,
  `filtrarPorCategoria`, `filtrarPorPreco`, `irParaPagina`, `ordenarPor`).
- **Sem seletores nem URLs dentro dos passos.** Locators por `getByTestId` (o atributo é
  `data-test`), depois `getByRole`, `getByLabel` e `getByText`.
- **Esperas:** ações que recarregam a lista esperam pela resposta da API
  (`waitForResponse(r => r.url().includes('/products'))`, registado **antes** do clique).
  Asserções sobre listas usam `expect(async () => {...}).toPass()`. **Nunca `waitForTimeout`.**
- **Navegação** partilhada em `navegacao.steps.ts`; **conta** (registar e usar) em `conta.steps.ts`.
  Cada passo é definido **uma só vez**.
- Contornos de bugs com comentário e link para o issue:
  `// Contorno do bug #N: ... Ver: <link>`.

## Gherkin

- `# language: pt`; história `Como / Quero / Para`; personas `cliente da Toolshop` e
  `visitante da Toolshop`.
- Passos em PT-PT, na primeira pessoa, em estilo declarativo. Os `Dado` começam por "que".
- Textos da interface, produtos e categorias **em inglês, entre aspas e exatos**
  (`"My account"`, `"Invalid email or password"`, `"Pliers"`).
- Usa `Esquema do Cenário` quando só os dados variam. Placeholders sem acentos, em snake_case.
- **Reutiliza os passos existentes** (vê `steps/`) antes de criar novos.
- Cenários que dependem de quais produtos aparecem em cada página: **ordena primeiro**
  (`E ordeno os produtos por "nome crescente"`). A ordem por omissão não é garantida.

## Regras e armadilhas da Toolshop

- Pesquisa: não distingue maiúsculas. Intervalos de preço: limites inclusivos.
- Login falhado: "Invalid email or password", igual para email inexistente e para password errada.
- **Bloqueio:** à 3.ª falha, a conta fica bloqueada e recusa até a password certa
  ("Account locked, too many failed attempts. Please contact the administrator.").
  Nunca uses as contas de demonstração partilhadas em testes de password errada.
- `LoginPage.fazerLogin` espera pela resposta de `POST /users/login`, para permitir várias
  tentativas seguidas.
- **Bug #1:** o filtro de preço mostra resultados desatualizados (respostas fora de ordem).
  Contorno: o slider move-se com o teclado e espera por cada resposta.
- **Bug #2:** a procura de morada no registo pode apagar o distrito. O `RegisterPage`
  preenche o distrito no fim e repete se ficar vazio.
- **Questão #3:** o distrito não é validado em relação à cidade.
- Fonte de verdade para seletores e regras: código-fonte em
  `github.com/testsmith-io/practice-software-testing`, pasta `sprint5`.

## Git

- Commits pequenos, com mensagens em PT-PT que digam o quê e porquê.
- Não incluas `Claude outputs/`, que está no `.gitignore`.
- Antes de fazer push, corre os testes afetados.
