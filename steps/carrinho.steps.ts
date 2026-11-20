import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { CheckoutPage } from '../pages/CheckoutPage';

// O carrinho é a etapa 1 do checkout: mesma página, por isso usa o CheckoutPage.
// "que tenho o produto {string} no carrinho" e "o meu carrinho fica vazio"
// estão em checkout.steps.ts e são reutilizados aqui.

// ---------- Contexto (Dado) ----------

Given('que abro o meu carrinho', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.abrirCarrinho();
});

// ---------- Ação (Quando) ----------

When('altero a quantidade de {string} para {int}', async ({ page }, produto: string, quantidade: number) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.alterarQuantidade(produto, quantidade);
});

When('removo {string} do carrinho', async ({ page }, produto: string) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.removerProduto(produto);
});

// ---------- Resultado (Então) ----------

Then('o total do carrinho é {int} vezes o preço de {string}',
    async ({ page }, quantidade: number, produto: string) => {
        const checkoutPage = new CheckoutPage(page);
        // O preço vem do ecrã ("$14.15"): o teste não depende de um preço fixo
        const precoTexto = (await checkoutPage.precoProduto(produto).textContent()) ?? '';
        // Contas em cêntimos, para evitar erros de arredondamento (14.15 * 3 = 42.449999...)
        const precoCentimos = Math.round(Number(precoTexto.replace(/[^0-9.]/g, '')) * 100);
        const totalEsperado = `$${((precoCentimos * quantidade) / 100).toFixed(2)}`;
        await expect(checkoutPage.totalCarrinho).toHaveText(totalEsperado);
    });

// Acessibilidade: primeiro o controlo (o botão existe e vê-se), depois a regra (um leitor
// de ecrã encontra-o como botão, com um nome que diz o que faz). Assim, se falhar, é pela
// acessibilidade e não por o botão não estar lá.
Then('o botão de remover {string} tem um nome que um leitor de ecrã anuncia',
    async ({ page }, produto: string) => {
        const checkoutPage = new CheckoutPage(page);
        await expect(checkoutPage.botaoRemoverPorCss(produto), 'o botão de remover devia estar visível').toBeVisible();
        await expect(checkoutPage.botaoRemoverAcessivel(produto), 'botão "remover" com nome acessível').toBeVisible({ timeout: 2_000 });
    });
