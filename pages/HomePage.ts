import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly campoPesquisa: Locator;
    readonly botaoPesquisar: Locator;
    readonly legendaPesquisa: Locator;
    readonly nomesProdutos: Locator;
    readonly semResultados: Locator;
    readonly filtroCategoria: Locator;
    readonly pegaPrecoMin: Locator;
    readonly pegaPrecoMax: Locator;
    readonly precosProdutos: Locator;
    readonly menuOrdenacao: Locator;

    constructor(page: Page) {
        this.page = page;
        this.campoPesquisa = page.getByTestId('search-query');
        this.botaoPesquisar = page.getByTestId('search-submit');
        this.legendaPesquisa = page.getByTestId('search-caption');
        this.nomesProdutos = page.getByTestId('product-name');
        this.semResultados = page.getByTestId('no-results');
        this.filtroCategoria = page.getByTestId('category-filter');
        this.pegaPrecoMin = page.getByRole('slider', { name: 'ngx-slider', exact: true });
        this.pegaPrecoMax = page.getByRole('slider', { name: 'ngx-slider-max' });
        this.precosProdutos = page.getByTestId('product-price');
        this.menuOrdenacao = page.getByTestId('sort');

    }

    async abrir() {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(this.nomesProdutos.first()).toBeVisible();
    }

    async pesquisar(termo: string) {
        await this.campoPesquisa.fill(termo);
        await this.botaoPesquisar.click();
    }

    async filtrarPorCategoria(categoria: string) {
        const listaRecarregada = this.page.waitForResponse(resposta => resposta.url().includes('/products'));
        await this.page.getByLabel(categoria, { exact: true }).check();
        await listaRecarregada;
    }

    async irParaPagina(numero: number) {
        const listaRecarregada = this.page.waitForResponse(resposta => resposta.url().includes('/products'));
        await this.page.getByRole('button', { name: `Page-${numero}`, exact: true }).click();
        await listaRecarregada;
    }

    // Mínimo: parte do início da barra e avança
    private async moverPegaMinimo(valor: number) {
        const inicio = Number(await this.pegaPrecoMin.getAttribute('aria-valuemin'));
        const fim = Number(await this.pegaPrecoMax.getAttribute('aria-valuemax'));
        const salto = (fim - inicio) / 10;

        await this.pegaPrecoMin.focus();
        await this.premirTecla(this.pegaPrecoMin, 'Home');
        let atual = inicio;
        while (valor - atual >= salto) {
            await this.premirTecla(this.pegaPrecoMin, 'PageUp');
            atual += salto;
        }
        while (atual < valor) {
            await this.premirTecla(this.pegaPrecoMin, 'ArrowRight');
            atual += 1;
        }
        await expect(this.pegaPrecoMin).toHaveAttribute('aria-valuenow', String(valor));
    }

    // Máximo: parte do fim da barra e recua
    private async moverPegaMaximo(valor: number) {
        const inicio = Number(await this.pegaPrecoMin.getAttribute('aria-valuemin'));
        const fim = Number(await this.pegaPrecoMax.getAttribute('aria-valuemax'));
        const salto = (fim - inicio) / 10;

        await this.pegaPrecoMax.focus();
        await this.premirTecla(this.pegaPrecoMax, 'End');
        let atual = fim;
        while (atual - valor >= salto) {
            await this.premirTecla(this.pegaPrecoMax, 'PageDown');
            atual -= salto;
        }
        while (atual > valor) {
            await this.premirTecla(this.pegaPrecoMax, 'ArrowLeft');
            atual -= 1;
        }
        await expect(this.pegaPrecoMax).toHaveAttribute('aria-valuenow', String(valor));
    }

    // Carrega numa tecla e, se o valor do slider mudar, espera que a lista recarregue
    private async premirTecla(pega: Locator, tecla: string) {
        const valorAntes = await pega.getAttribute('aria-valuenow');
        const listaRecarregada = this.page
            .waitForResponse(resposta => resposta.url().includes('/products'), { timeout: 10_000 })
            .catch(() => null);

        await pega.press(tecla);

        const valorDepois = await pega.getAttribute('aria-valuenow');
        if (valorDepois !== valorAntes) {
            await listaRecarregada;
        }
    }


    async filtrarPorPreco(min: number, max: number) {
        // Primeiro o máximo (vai ao fim e recua), depois o mínimo (vai ao início e avança).
        // Assim as pegas nunca se cruzam, e o slider nunca lhes troca os papéis.
        await this.moverPegaMaximo(max);
        await this.moverPegaMinimo(min);
    }

    async ordenarPor(valor: string) {
        await this.menuOrdenacao.selectOption(valor);
    }
}

