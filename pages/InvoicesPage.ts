import { type Page, type Locator, expect } from '@playwright/test';

// Página "My invoices" (/account/invoices): as faturas do cliente com sessão iniciada
export class InvoicesPage {
    // 1. A LISTA dos elementos desta página
    readonly page: Page;
    readonly menuUtilizador: Locator;
    readonly linkFaturas: Locator;
    readonly titulo: Locator;

    // 2. ONDE encontrar cada elemento
    constructor(page: Page) {
        this.page = page;
        // O menu com o nome do cliente, no topo da página
        this.menuUtilizador = page.getByTestId('nav-menu');
        this.linkFaturas = page.getByTestId('nav-my-invoices');
        this.titulo = page.getByTestId('page-title');
    }

    // 3. AÇÕES que se podem fazer nesta página

    // O cliente chega às faturas pelo menu com o seu nome, como um utilizador real
    async abrirPeloMenu() {
        await this.menuUtilizador.click();
        await this.linkFaturas.click();
        await expect(this.page).toHaveURL(/account\/invoices/);
        await expect(this.titulo).toHaveText('Invoices');
    }

    // As linhas da tabela não têm data-test: procuramos a linha pelo número da fatura
    linhaFatura(numero: string): Locator {
        return this.page.getByRole('row').filter({ hasText: numero });
    }
}
