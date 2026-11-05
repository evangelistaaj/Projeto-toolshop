import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Pesquisa de produtos', () => {

    test('pesquisa mostra apenas produtos com o termo pesquisado', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.abrir();
        await homePage.pesquisar('pliers');

        // A legenda confirma o que foi pesquisado
        await expect(homePage.legendaPesquisa).toContainText('pliers');

        // Há pelo menos um resultado
        await expect(homePage.nomesProdutos.first()).toBeVisible();

        // Nenhum resultado SEM a palavra "pliers"
        await expect(homePage.nomesProdutos.filter({ hasNotText: /pliers/i })).toHaveCount(0);
    });
});