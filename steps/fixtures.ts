import { test as base, createBdd } from 'playwright-bdd';
import { type Utilizador } from '../utils/dados';

// O que a caixa pode guardar
type Contexto = {
    utilizador?: Utilizador;
};

// Cada cenário recebe uma caixa nova e vazia
export const test = base.extend<{ contexto: Contexto }>({
    contexto: async ({}, use) => {
        await use({});
    },
});

export const { Given, When, Then } = createBdd(test);