import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
    // 1. A LISTA dos elementos desta página
    readonly page: Page;
    readonly email: Locator;
    readonly password: Locator;
    readonly botaoLogin: Locator;
    readonly mensagemErro: Locator;

    // 2. ONDE encontrar cada elemento
    constructor(page: Page) {
        this.page = page;
        this.email = page.getByTestId('email');
        this.password = page.getByTestId('password');
        this.botaoLogin = page.getByTestId('login-submit');
        this.mensagemErro = page.getByTestId('login-error');
    }

    // 3. AÇÕES que se podem fazer nesta página
    async abrir() {
        await this.page.goto('/auth/login');
        await expect(this.email).toBeVisible();
    }

    async fazerLogin(utilizador: string, password: string) {
        await this.email.fill(utilizador);
        await this.password.fill(password);
        await this.botaoLogin.click();
    }
}