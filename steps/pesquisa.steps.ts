import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

const { Given, When, Then } = createBdd();

Given('que estou na página de produtos', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.abrir();
});

When('pesquiso por {string}', async ({ page }, termo: string) => {
    const homePage = new HomePage(page);
    await homePage.pesquisar(termo);
});

Then('todos os resultados contêm {string}', async ({ page }, termo: string) => {
    const homePage = new HomePage(page);
    await expect(homePage.legendaPesquisa).toContainText(termo);
    await expect(homePage.nomesProdutos.first()).toBeVisible();
    await expect(homePage.nomesProdutos.filter({ hasNotText: new RegExp(termo, 'i') })).toHaveCount(0);
});

