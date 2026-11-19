import { expect } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { Given, When, Then } from './fixtures';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { criarProduto } from '../utils/produtos';

// Regra da Toolshop (código-fonte do carrinho e da API): um produto é ecológico se a
// classificação CO2 for A ou B, e há 5% de desconto quando MAIS de metade das unidades
// no carrinho são de produtos ecológicos.
//
// Reutilizados: "altero a quantidade de {string} para {int}" (carrinho.steps.ts; o rótulo
// "Quantity for <nome>" encontra o produto pelo nome curto) e os passos do checkout.

// ---------- Contexto (Dado) ----------

// Cria os produtos pela API (preço e CO2 do cenário) e junta-os ao carrinho pela interface,
// como um cliente: abre cada produto, escolhe a quantidade e clica em "Add to cart".
Given('que tenho no carrinho os produtos:', async ({ page, request, contexto }, tabela: DataTable) => {
    contexto.produtos ??= {};
    for (const linha of tabela.hashes()) {
        const produto = await criarProduto(request, linha['produto'], Number(linha['preço']), linha['CO2']);
        contexto.produtos[linha['produto']] = produto; // guardado já, para a limpeza no fim

        const productPage = new ProductPage(page);
        await productPage.abrir(produto.id);
        // Abrimos o produto certo? O título também tem o selo "ECO" (classificação A ou B),
        // por isso procura-se o nome dentro do título. A referência única no nome garante
        // que nenhum outro produto passa por este.
        await expect(productPage.nomeProduto).toContainText(produto.nome);
        await productPage.adicionarAoCarrinhoComQuantidade(Number(linha['quantidade']));
    }
});

// Guarda o total que o cliente vê no carrinho, para o comparar com a fatura no fim
Given('que vejo o total no carrinho', async ({ page, contexto }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.abrirCarrinho();
    await expect(checkoutPage.totalCarrinho).toHaveText(/^\$\d+\.\d{2}$/);
    contexto.totalCarrinho = (await checkoutPage.totalCarrinho.textContent())!.trim();
});

// ---------- Ação (Quando) ----------

When('abro o meu carrinho', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.abrirCarrinho();
});

// ---------- Resultado (Então) ----------

Then('o carrinho mostra o desconto ecológico de {string}', async ({ page }, valor: string) => {
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.rotuloDescontoEcologico).toBeVisible();
    // No ecrã: "- $1.25"
    await expect(checkoutPage.descontoEcologico).toHaveText(`- ${valor}`);
});

Then('o carrinho não mostra desconto ecológico', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    // Primeiro, o carrinho tem de estar carregado; senão, "não aparece" passava sem provar nada
    await expect(checkoutPage.totalCarrinho).toHaveText(/^\$\d+\.\d{2}$/);
    await expect(checkoutPage.descontoEcologico).toBeHidden();
    await expect(checkoutPage.rotuloDescontoEcologico).toBeHidden();
});

Then('o subtotal do carrinho é {string}', async ({ page }, valor: string) => {
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.subtotalCarrinho).toHaveText(valor);
});

Then('o total do carrinho é {string}', async ({ page }, valor: string) => {
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.totalCarrinho).toHaveText(valor);
});

// O oráculo não é um valor fixo: é o que o próprio carrinho mostrou ao cliente
Then('a fatura nas minhas faturas tem o total que o carrinho mostrava', async ({ page, contexto }) => {
    if (!contexto.totalCarrinho) {
        throw new Error('Nenhum total do carrinho guardado. Falta o passo "Dado que vejo o total no carrinho"?');
    }
    if (!contexto.numeroFatura) {
        throw new Error('Nenhum número de fatura guardado. Falta o passo "vejo a confirmação da encomenda..."?');
    }
    const invoicesPage = new InvoicesPage(page);
    await invoicesPage.abrirPeloMenu();
    await expect(
        invoicesPage.totalFatura(contexto.numeroFatura),
        `o cliente viu ${contexto.totalCarrinho} no carrinho`,
    ).toHaveText(contexto.totalCarrinho);
});

// ---------- Selo "ECO" na página do produto ----------

Given('que existe na loja o produto {string} com classificação CO2 {string}',
    async ({ request, contexto }, nome: string, co2: string) => {
        contexto.produtos ??= {};
        contexto.produtos[nome] = await criarProduto(request, nome, 10.0, co2);
    });

When('abro a página do produto {string}', async ({ page, contexto }, nome: string) => {
    const produto = contexto.produtos?.[nome];
    if (!produto) {
        throw new Error(`O produto "${nome}" não foi criado neste cenário. Falta o passo "Dado que existe na loja o produto..."?`);
    }
    const productPage = new ProductPage(page);
    await productPage.abrir(produto.id);
    await expect(productPage.nomeProduto).toContainText(produto.nome); // abrimos o produto certo?
});

Then(/^a página do produto (mostra|não mostra) o selo "ECO"$/, async ({ page }, resultado: string) => {
    const productPage = new ProductPage(page);
    if (resultado === 'mostra') {
        await expect(productPage.seloEco).toBeVisible();
        await expect(productPage.seloEco).toHaveText('ECO');
    } else {
        // O passo "abro a página do produto" já confirmou que a página carregou,
        // por isso "não aparece" não passa só por a página estar vazia.
        await expect(productPage.seloEco).toBeHidden();
    }
});
