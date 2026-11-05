import { type Page, type Locator } from '@playwright/test';

export class AccountPage {
    readonly page: Page;
    readonly titulo: Locator;

    constructor(page: Page) {
        this.page = page;
        this.titulo = page.getByTestId('page-title');
    }
}