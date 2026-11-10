import { type Page, type Locator, expect } from '@playwright/test';

// Página de detalhe de um produto (/product/<id>)
export class ProductPage {
    // 1. A LISTA dos elementos desta página
    readonly page: Page;
    readonly nomeProduto: Locator;
    readonly categoriaProduto: Locator;
    readonly marcaProduto: Locator;
    readonly precoProduto: Locator;
    readonly rankingProduto: Locator;
    readonly descricaoProduto: Locator;
    readonly botaoDiminuirQuantidade: Locator;
    readonly botaoAumentarQuantidade: Locator;
    readonly botaoQuantidadeProduto: Locator;
    readonly botaoAdicionarAoCarrinho: Locator;
    readonly botaoAdicionarAoFavorito: Locator;
    readonly botaoCompare: Locator;
    readonly especificacoes: Locator;
    readonly contadorCarrinho: Locator;

    // 2. ONDE encontrar cada elemento
    constructor(page: Page) {
        this.page = page;
        this.nomeProduto = page.getByTestId('product-name');
        this.categoriaProduto = page.getByTestId('category');
        this.marcaProduto = page.getByTestId('brand');
        this.precoProduto = page.getByTestId('price-section');
        this.rankingProduto = page.getByTestId('co2-rating-badge');
        this.descricaoProduto = page.getByTestId('product-description');
        this.botaoDiminuirQuantidade = page.getByTestId('decrease-quantity');
        this.botaoAumentarQuantidade = page.getByTestId('increase-quantity');
        this.botaoQuantidadeProduto = page.getByTestId('quantity');
        this.botaoAdicionarAoCarrinho = page.getByTestId('add-to-cart');
        this.botaoAdicionarAoFavorito = page.getByTestId('add-to-favorite');
        this.botaoCompare = page.getByTestId('compare');
        this.especificacoes = page.getByTestId('specs-title');
        // O balão vermelho do carrinho, no menu do topo
        this.contadorCarrinho = page.getByTestId('cart-quantity');
    }

    // 3. AÇÕES que se podem fazer nesta página
    async adicionarAoCarrinho() {
        // Sem stock, o botão fica desligado e o clique esperava até ao fim do tempo do teste.
        // Assim falha em 5 s, com uma mensagem que diz logo o que se passa.
        await expect(this.botaoAdicionarAoCarrinho, 'O botão "Add to cart" está desligado: o produto tem stock?').toBeEnabled();
        await this.botaoAdicionarAoCarrinho.click();
        await expect(this.contadorCarrinho).toBeVisible();
    }

    async adicionarAoFavorito() {
        await this.botaoAdicionarAoFavorito.click();
        await expect(this.botaoAdicionarAoFavorito).toBeVisible();
    }

    async adicionarQuantidade() {
        await this.botaoAumentarQuantidade.click();
        await expect(this.botaoAumentarQuantidade).toBeVisible();
    }

    async diminuirQuantidade() {
        await this.botaoDiminuirQuantidade.click();
        await expect(this.botaoDiminuirQuantidade).toBeVisible();
    }
    async comparar() {
        await this.botaoCompare.click();
        await expect(this.botaoCompare).toBeVisible();
    }

}