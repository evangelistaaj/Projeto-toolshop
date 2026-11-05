import { type Page, type Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly campoPesquisa: Locator;
    readonly botaoPesquisar: Locator;
    readonly legendaPesquisa: Locator;
    readonly nomesProdutos: Locator;

    constructor(page: Page) {
        this.page = page;
        this.campoPesquisa = page.getByTestId('search-query');
        this.botaoPesquisar = page.getByTestId('search-submit');
        this.legendaPesquisa = page.getByTestId('search-caption');
        this.nomesProdutos = page.getByTestId('product-name');
    }

    async abrir() {
        await this.page.goto('/');
    }

    async pesquisar(termo: string) {
        await this.campoPesquisa.fill(termo);
        await this.botaoPesquisar.click();
    }
}