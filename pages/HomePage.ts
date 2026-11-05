import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly campoPesquisa: Locator;
    readonly botaoPesquisar: Locator;
    readonly legendaPesquisa: Locator;
    readonly nomesProdutos: Locator;
    readonly semResultados: Locator;

    constructor(page: Page) {
        this.page = page;
        this.campoPesquisa = page.getByTestId('search-query');
        this.botaoPesquisar = page.getByTestId('search-submit');
        this.legendaPesquisa = page.getByTestId('search-caption');
        this.nomesProdutos = page.getByTestId('product-name');
        this.semResultados = page.getByTestId('no-results');
    }

    async abrir() {
        await this.page.goto('/');
        // Esperar pela lista inicial de produtos antes de fazer qualquer coisa
        await expect(this.nomesProdutos.first()).toBeVisible();
    }

    async pesquisar(termo: string) {
        await this.campoPesquisa.fill(termo);
        await this.botaoPesquisar.click();
    }
}