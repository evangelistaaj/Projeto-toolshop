import { Given } from './fixtures';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Frases de navegação, partilhadas por todas as features

Given('que estou na página de produtos', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.abrir();
});

Given('que estou na página de login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.abrir();
});

Given('que estou na página de registo', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.abrir();
});