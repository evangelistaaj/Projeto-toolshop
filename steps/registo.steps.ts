import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { gerarUtilizador } from '../utils/dados';

Given('que estou na página de registo', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.abrir();
});

When('registo um novo utilizador com dados válidos', async ({ page }) => {
    const utilizador = gerarUtilizador();
    console.log(`Utilizador criado: ${utilizador.email}`); // para saberes qual foi
    const registerPage = new RegisterPage(page);
    await registerPage.registar(utilizador);
});

Then('sou redirecionado para a página de login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(/auth\/login/);
    await expect(loginPage.titulo).toBeVisible();
});