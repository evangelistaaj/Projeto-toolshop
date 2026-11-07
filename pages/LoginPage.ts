import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
    // 1. A LISTA dos elementos desta página
    readonly page: Page;
    readonly email: Locator;
    readonly password: Locator;
    readonly botaoLogin: Locator;
    readonly mensagemErro: Locator;
    readonly titulo: Locator;

    // 2. ONDE encontrar cada elemento
    constructor(page: Page) {
        this.page = page;
        this.email = page.getByTestId('email');
        this.password = page.getByTestId('password');
        this.botaoLogin = page.getByTestId('login-submit');
        this.mensagemErro = page.getByTestId('login-error');
        this.titulo = page.getByRole('heading', { name: 'Login' });
    }

    // 3. AÇÕES que se podem fazer nesta página
    async abrir() {
        await this.page.goto('/auth/login');
        await expect(this.titulo).toBeVisible();
    }

    async fazerLogin(utilizador: string, password: string) {
        await this.email.fill(utilizador);
        await this.password.fill(password);
        // Espera pela resposta da API de login antes de continuar.
        // Assim dá para fazer várias tentativas seguidas sem se atropelarem:
        // depois da 1.ª falha a mensagem de erro já está visível e não serve de sinal.
        const resposta = this.page.waitForResponse(
            (r) => r.url().includes('/users/login') && r.request().method() === 'POST',
        );
        await this.botaoLogin.click();
        await resposta;
    }
}