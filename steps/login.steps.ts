import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';
import { When, Then } from './fixtures';

When('faço login com {string} e {string}', async ({ page }, email: string, password: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.fazerLogin(email, password);
});

Then('vejo a página {string}', async ({ page }, titulo: string) => {
    const accountPage = new AccountPage(page);
    await expect(accountPage.titulo).toHaveText(titulo);
});

Then('vejo a mensagem de erro {string}', async ({ page }, mensagem: string) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.mensagemErro).toContainText(mensagem);
});