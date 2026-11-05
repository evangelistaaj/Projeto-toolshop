import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';

test.describe('Login', () => {

    test('login com utilizador válido', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const accountPage = new AccountPage(page);

        await loginPage.abrir();
        await loginPage.fazerLogin('customer@practicesoftwaretesting.com', 'welcome01');

        await expect(page).toHaveURL(/account/);
        await expect(accountPage.titulo).toHaveText('My account');
    });

    test('login com password errada mostra erro', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.abrir();
        await loginPage.fazerLogin('customer@practicesoftwaretesting.com', 'welcome');

        await expect(loginPage.mensagemErro).toContainText('Invalid email or password');
    });


});