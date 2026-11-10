import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';
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


// ---------- Ação (Quando) ----------

When('confirmo a encomenda', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.confirmarEncomenda();
});

// ---------- Resultado (Então) ----------

Then('vejo a confirmação da encomenda com um número de fatura', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    // O número muda em cada compra: verificamos o FORMATO, não o número exato
    await expect(checkoutPage.confirmacaoEncomenda).toContainText('Thanks for your order!');
    await expect(checkoutPage.confirmacaoEncomenda).toContainText(/INV-\d+/);
});

