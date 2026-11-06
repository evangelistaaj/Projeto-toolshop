import { expect } from '@playwright/test';
import { Given, When } from './fixtures';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { gerarUtilizador } from '../utils/dados';

Given('que tenho uma conta registada', async ({ page, contexto }) => {
    const utilizador = gerarUtilizador();
    const registerPage = new RegisterPage(page);
    await registerPage.abrir();
    await registerPage.registar(utilizador);
    await expect(page).toHaveURL(/auth\/login/);

    // Guardar o utilizador na caixa, para os próximos passos
    contexto.utilizador = utilizador;
});

When('faço login com a conta registada', async ({ page, contexto }) => {
    if (!contexto.utilizador) {
        throw new Error('Nenhuma conta foi registada neste cenário');
    }
    const loginPage = new LoginPage(page);
    await loginPage.fazerLogin(contexto.utilizador.email, contexto.utilizador.password);
});