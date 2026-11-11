import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { gerarUtilizador } from '../utils/dados';

// ---------- Contexto (Dado) ----------

Given('que tenho o produto {string} no carrinho', async ({ page }, produto: string) => {
    const homePage = new HomePage(page);
    await homePage.abrir();
    await homePage.pesquisar(produto);
    await homePage.abrirProduto(produto);

    const productPage = new ProductPage(page);
    await expect(productPage.nomeProduto).toHaveText(produto); // abrimos o produto certo?
    await productPage.adicionarAoCarrinho();
});

// O passo "que tenho uma conta registada" já existe em conta.steps.ts
// e guarda o utilizador em contexto.utilizador.

Given('que inicio sessão no checkout com a conta registada', async ({ page, contexto }) => {
    if (!contexto.utilizador) {
        throw new Error('Nenhuma conta registada neste cenário. Falta o passo "Dado que tenho uma conta registada"?');
    }
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.abrirPeloCarrinho();
    await checkoutPage.iniciarSessao(contexto.utilizador.email, contexto.utilizador.password);
});

Given('que continuo como convidado no checkout', async ({ page, contexto }) => {
    // O convidado também é um "utilizador": precisa de email, nome e, a seguir, morada
    contexto.utilizador = gerarUtilizador();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.abrirPeloCarrinho();
    await checkoutPage.continuarComoConvidado(contexto.utilizador);
});

Given('que indico uma morada de entrega válida', async ({ page, contexto }) => {
    // Com conta ou como convidado, os dados da morada vêm do utilizador do cenário
    const utilizador = contexto.utilizador ?? gerarUtilizador();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.indicarMorada(utilizador);
});

Given('que escolho o método de pagamento {string}', async ({ page }, metodo: string) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.escolherPagamento(metodo);
});

Given('que escolho o método de pagamento {string} em {string}',
    async ({ page }, metodo: string, prestacoes: string) => {
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.escolherPagamento(metodo, prestacoes);
    });

// Cenário do bug #4: uma cidade que não é a que a pesquisa devolve para o código postal
Given('que indico uma morada de entrega com uma cidade que não corresponde ao código postal',
    async ({ page, contexto }) => {
        const utilizador = contexto.utilizador ?? gerarUtilizador();
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.indicarMoradaComOutraCidade(utilizador, 'Cidade Inventada');
    });


// ---------- Ação (Quando) ----------

When('confirmo a encomenda', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.confirmarEncomenda();
});

// ---------- Cenários negativos (Quando) ----------

When('tento continuar como convidado com o email {string}', async ({ page, contexto }, email: string) => {
    contexto.utilizador = { ...gerarUtilizador(), email };
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.abrirPeloCarrinho();
    await checkoutPage.preencherConvidado(contexto.utilizador);
});

When('indico uma morada de entrega sem rua', async ({ page, contexto }) => {
    const utilizador = contexto.utilizador ?? gerarUtilizador();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.indicarMoradaSemRua(utilizador);
});

// {word}: uma palavra sem espaços ("número", "validade", "CVV")
When('pago com cartão de crédito com {word} {string}', async ({ page }, campo: string, valor: string) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.escolherPagamento('Credit Card'); // primeiro, um cartão todo válido...
    await checkoutPage.alterarCampoCartao(campo, valor); // ...depois, só UM campo inválido
});

// ---------- Resultado (Então) ----------

Then('vejo a confirmação da encomenda com um número de fatura', async ({ page, contexto }) => {
    const checkoutPage = new CheckoutPage(page);
    // O número muda em cada compra: verificamos o FORMATO, não o número exato
    await expect(checkoutPage.confirmacaoEncomenda).toContainText('Thanks for your order!');
    await expect(checkoutPage.confirmacaoEncomenda).toContainText(/INV-\d+/);
    // Guardamos o número que o cliente vê, para os passos seguintes (ex.: as faturas na conta)
    contexto.numeroFatura = await checkoutPage.lerNumeroFatura();
});

Then('encontro essa fatura nas minhas faturas', async ({ page, contexto }) => {
    if (!contexto.numeroFatura) {
        throw new Error('Nenhum número de fatura guardado. Falta o passo "vejo a confirmação da encomenda..."?');
    }
    const invoicesPage = new InvoicesPage(page);
    await invoicesPage.abrirPeloMenu();
    await expect(invoicesPage.linhaFatura(contexto.numeroFatura)).toBeVisible();
});

Then('o meu carrinho fica vazio', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.linkCarrinho).toBeHidden();
});

Then('vejo o aviso {string}', async ({ page }, texto: string) => {
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.aviso(texto)).toBeVisible();
});

Then('não consigo avançar para o pagamento', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.botaoAvancarMorada).toBeDisabled();
});

Then('não consigo confirmar a encomenda', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.botaoFinalizar).toBeDisabled();
});

Then('sou avisado de que a encomenda não foi criada', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    // Onde a Toolshop já mostra os erros de pagamento
    await expect(checkoutPage.mensagemErroPagamento).toBeVisible();
});
