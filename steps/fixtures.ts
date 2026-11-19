import { test as base, createBdd } from 'playwright-bdd';
import { type Utilizador } from '../utils/dados';
import { type ProdutoCriado, apagarProdutos } from '../utils/produtos';

// O que a caixa pode guardar
type Contexto = {
    utilizador?: Utilizador;
    faixaPreco?: { min: number; max: number };
    numeroFatura?: string; // guardado quando a confirmação da encomenda aparece
    produtos?: Record<string, ProdutoCriado>; // criados pelo cenário, pelo nome curto do Gherkin
    totalCarrinho?: string; // o total que o cliente viu no carrinho (ex.: "$9.59")
};

// Cada cenário recebe uma caixa nova e vazia
export const test = base.extend<{ contexto: Contexto }>({
    contexto: async ({ request }, use) => {
        const contexto: Contexto = {};
        await use(contexto);
        // Limpeza: apaga os produtos que o cenário criou
        await apagarProdutos(request, Object.values(contexto.produtos ?? {}));
    },
});

export const { Given, When, Then } = createBdd(test);
