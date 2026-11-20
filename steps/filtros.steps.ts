
import { expect } from '@playwright/test';
import { When, Then } from './fixtures';
import { HomePage } from '../pages/HomePage';
import { DataTable } from 'playwright-bdd';
import { produtosDaApi } from '../utils/catalogo';

When('filtro por {string}', async ({ page, contexto }, categoria: string) => {
    const homePage = new HomePage(page);
    await homePage.filtrarPorCategoria(categoria);
    // Filtrar volta à página 1
    contexto.filtro = { ...contexto.filtro, categoria, pagina: undefined };
});


When('filtro pela categoria {string}', async ({ page, contexto }, categoria: string) => {
    const homePage = new HomePage(page);
    await homePage.filtrarPorCategoria(categoria);
    // Filtrar volta à página 1
    contexto.filtro = { ...contexto.filtro, categoria, pagina: undefined };
});


Then('vejo apenas os produtos:', async ({ page }, tabela: DataTable) => {
    const esperados = tabela.raw().map(linha => linha[0]).sort();
    const homePage = new HomePage(page);

    await expect(async () => {
        const nomes = (await homePage.nomesProdutos.allTextContents()).map(nome => nome.trim()).sort();
        expect(nomes).toEqual(esperados);
    }).toPass({ timeout: 10_000 });
});


// Lista exata ("nem mais nem menos"), com a API como oráculo: os mesmos produtos que a API
// devolve para a mesma categoria, ordem e página (ver utils/catalogo.ts). A ordem dentro
// da página não conta, como no passo da tabela.
Then('vejo os mesmos produtos que a API devolve para esse filtro', async ({ page, request, contexto }) => {
    const esperados = (await produtosDaApi(request, contexto.filtro ?? {})).sort();
    const homePage = new HomePage(page);

    await expect(async () => {
        const nomes = (await homePage.nomesProdutos.allTextContents()).map(nome => nome.trim()).sort();
        expect(nomes).toEqual(esperados);
    }).toPass({ timeout: 10_000 });
});


When('filtro por preço entre {int} e {int}', async ({ page, contexto }, min: number, max: number) => {
    const homePage = new HomePage(page);
    await homePage.filtrarPorPreco(min, max);
    contexto.faixaPreco = { min, max };
    contexto.filtro = { ...contexto.filtro, preco: { min, max }, pagina: undefined };
});


When('vou para a página {int}', async ({ page, contexto }, numero: number) => {
    const homePage = new HomePage(page);
    await homePage.irParaPagina(numero);
    contexto.filtro = { ...contexto.filtro, pagina: numero };
});


Then('todos os resultados estão dentro do intervalo de preço', async ({ page, contexto }) => {
    if (!contexto.faixaPreco) {
        throw new Error('Nenhum filtro de preço foi aplicado neste cenário');
    }
    const { min, max } = contexto.faixaPreco;
    const homePage = new HomePage(page);

    await expect(async () => {
        const textos = await homePage.precosProdutos.allTextContents();
        const precos = textos.map(texto => parseFloat(texto.replace('$', '')));

        expect(precos.length).toBeGreaterThan(0);
        for (const preco of precos) {
            expect(preco).toBeGreaterThanOrEqual(min);
            expect(preco).toBeLessThanOrEqual(max);
        }
    }).toPass({ timeout: 10_000 });
});


// Dicionário: linguagem de negócio → detalhes técnicos
type Ordenacao = { valor: string; campo: 'nome' | 'preco'; direcao: 'asc' | 'desc' };

const ordenacoes: Record<string, Ordenacao> = {
    'nome crescente': { valor: 'name,asc', campo: 'nome', direcao: 'asc' },
    'nome decrescente': { valor: 'name,desc', campo: 'nome', direcao: 'desc' },
    'preço crescente': { valor: 'price,asc', campo: 'preco', direcao: 'asc' },
    'preço decrescente': { valor: 'price,desc', campo: 'preco', direcao: 'desc' },
};

function obterOrdenacao(criterio: string): Ordenacao {
    const ordenacao = ordenacoes[criterio];
    if (!ordenacao) {
        throw new Error(`Ordenação desconhecida: "${criterio}". Opções válidas: ${Object.keys(ordenacoes).join(', ')}`);
    }
    return ordenacao;
}

When('ordeno os produtos por {string}', async ({ page, contexto }, criterio: string) => {
    const homePage = new HomePage(page);
    const { valor } = obterOrdenacao(criterio);
    await homePage.ordenarPor(valor);
    // Ordenar volta à página 1
    contexto.filtro = { ...contexto.filtro, ordenacao: valor, pagina: undefined };
});

Then('os produtos aparecem ordenados por {string}', async ({ page }, criterio: string) => {
    const { campo, direcao } = obterOrdenacao(criterio);
    const homePage = new HomePage(page);

    await expect(async () => {
        if (campo === 'nome') {
            const nomes = (await homePage.nomesProdutos.allTextContents()).map(nome => nome.trim());
            const esperado = [...nomes].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
            if (direcao === 'desc') esperado.reverse();

            expect(nomes.length).toBeGreaterThan(1);
            expect(nomes).toEqual(esperado);
        } else {
            const precos = (await homePage.precosProdutos.allTextContents()).map(texto => parseFloat(texto.replace('$', '')));
            const esperado = [...precos].sort((a, b) => a - b);
            if (direcao === 'desc') esperado.reverse();

            expect(precos.length).toBeGreaterThan(1);
            expect(precos).toEqual(esperado);
        }
    }).toPass({ timeout: 10_000 });
});