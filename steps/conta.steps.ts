import { expect } from '@playwright/test';
import { Given, When } from './fixtures';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { gerarUtilizador, type Utilizador } from '../utils/dados';

// Devolve o utilizador guardado na caixa, ou falha com uma mensagem clara
function utilizadorDoCenario(contexto: { utilizador?: Utilizador }): Utilizador {
    if (!contexto.utilizador) {
        throw new Error('Nenhuma conta foi registada neste cenário');
    }
    return contexto.utilizador;
}

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
    const utilizador = utilizadorDoCenario(contexto);
    const loginPage = new LoginPage(page);
    await loginPage.fazerLogin(utilizador.email, utilizador.password);
});

When('faço login com a conta registada e a password {string}', async ({ page, contexto }, password: string) => {
    const utilizador = utilizadorDoCenario(contexto);
    const loginPage = new LoginPage(page);
    await loginPage.fazerLogin(utilizador.email, password);
});

// Cada falha soma 1 tentativa. À 3.ª, a Toolshop bloqueia a conta
// e passa a recusar até a password certa.
When('falho o login {int} vezes com a conta registada', async ({ page, contexto }, vezes: number) => {
    const utilizador = utilizadorDoCenario(contexto);
    const loginPage = new LoginPage(page);
    for (let i = 0; i < vezes; i++) {
        await loginPage.fazerLogin(utilizador.email, `${utilizador.password}-errada`);
        await expect(loginPage.mensagemErro).toContainText('Invalid email or password');
    }
});
