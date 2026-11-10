import { type Page, type Locator, expect } from '@playwright/test';
import { type Utilizador } from '../utils/dados';

export class CheckoutPage {
    // 1. A LISTA dos elementos desta página
    readonly page: Page;

    // Etapa 1: carrinho
    readonly linkCarrinho: Locator;
    readonly botaoAvancarCarrinho: Locator;

    // Etapa 2: login ou convidado
    readonly campoEmail: Locator;
    readonly campoPassword: Locator;
    readonly botaoEntrar: Locator;
    readonly separadorConvidado: Locator;
    readonly campoEmailConvidado: Locator;
    readonly campoNomeConvidado: Locator;
    readonly campoApelidoConvidado: Locator;
    readonly botaoConfirmarConvidado: Locator;
    readonly botaoAvancarComConta: Locator;
    readonly botaoAvancarConvidado: Locator;

    // Etapa 3: morada
    readonly campoPais: Locator;
    readonly campoCodigoPostal: Locator;
    readonly campoNumeroPorta: Locator;
    readonly campoRua: Locator;
    readonly campoCidade: Locator;
    readonly campoDistrito: Locator;
    readonly botaoAvancarMorada: Locator;
    readonly avisoPesquisaMorada: Locator;

    // Etapa 4: pagamento
    readonly metodoPagamento: Locator;
    readonly prestacoes: Locator;
    readonly botaoFinalizar: Locator;
    readonly mensagemPagamentoValido: Locator;
    readonly confirmacaoEncomenda: Locator;


    // 2. ONDE encontrar cada elemento
    constructor(page: Page) {
        this.page = page;

        // Etapa 1: carrinho
        this.linkCarrinho = page.getByTestId('nav-cart');
        this.botaoAvancarCarrinho = page.getByTestId('proceed-1');

        // Etapa 2: login ou convidado
        this.campoEmail = page.getByTestId('email');
        this.campoPassword = page.getByTestId('password');
        this.botaoEntrar = page.getByTestId('login-submit');
        this.separadorConvidado = page.getByRole('tab', { name: 'Continue as Guest' });
        this.campoEmailConvidado = page.getByTestId('guest-email');
        this.campoNomeConvidado = page.getByTestId('guest-first-name');
        this.campoApelidoConvidado = page.getByTestId('guest-last-name');
        this.botaoConfirmarConvidado = page.getByTestId('guest-submit');
        this.botaoAvancarComConta = page.getByTestId('proceed-2');
        this.botaoAvancarConvidado = page.getByTestId('proceed-2-guest');

        // Etapa 3: morada
        this.campoPais = page.getByTestId('country');
        this.campoCodigoPostal = page.getByTestId('postal_code');
        this.campoNumeroPorta = page.getByTestId('house_number');
        this.campoRua = page.getByTestId('street');
        this.campoCidade = page.getByTestId('city');
        this.campoDistrito = page.getByTestId('state');
        this.botaoAvancarMorada = page.getByTestId('proceed-3');
        this.avisoPesquisaMorada = page.getByTestId('postcode-lookup-loading'); // "Looking up your address..."

        // Etapa 4: pagamento
        this.metodoPagamento = page.getByTestId('payment-method');
        this.prestacoes = page.getByTestId('monthly_installments');
        this.botaoFinalizar = page.getByTestId('finish');
        this.mensagemPagamentoValido = page.getByTestId('payment-success-message');

        // A confirmação final
        this.confirmacaoEncomenda = page.locator('#order-confirmation');
    }

    // 3. AÇÕES que se podem fazer nesta página

    // Etapa 1: o cliente chega ao checkout pelo ícone do carrinho, como na exploração
    async abrirPeloCarrinho() {
        await this.linkCarrinho.click();
        await expect(this.botaoAvancarCarrinho).toBeVisible();
        await this.botaoAvancarCarrinho.click();
    }

    // Etapa 2, com conta
    async iniciarSessao(email: string, password: string) {
        const respostaLogin = this.page.waitForResponse(
            (r) => r.url().includes('/users/login') && r.request().method() === 'POST',
        );
        await this.campoEmail.fill(email);
        await this.campoPassword.fill(password);
        await this.botaoEntrar.click();
        await respostaLogin;
        await expect(this.botaoAvancarComConta).toBeEnabled();
        await this.botaoAvancarComConta.click();
    }

    // Etapa 2, como convidado
    async continuarComoConvidado(utilizador: Utilizador) {
        await this.separadorConvidado.click();
        await this.campoEmailConvidado.fill(utilizador.email);
        await this.campoNomeConvidado.fill(utilizador.nome);
        await this.campoApelidoConvidado.fill(utilizador.apelido);
        await this.botaoConfirmarConvidado.click();
        await expect(this.botaoAvancarConvidado).toBeEnabled();
        await this.botaoAvancarConvidado.click();
    }

    // Etapa 3: morada.
    // Como funciona a Toolshop (visto no código dela):
    //   - 300 ms depois de mudares o código postal OU o número da porta, faz uma
    //     pesquisa de morada; se mudares os dois, pode fazer DUAS;
    //   - a resposta reescreve rua, cidade e distrito, e o distrito vem vazio (bug #2);
    //   - com conta, a morada do registo já vem preenchida, menos o número da porta.
    // Se avançarmos com o distrito vazio, a encomenda é recusada no fim (422)
    // e o ecrã não mostra erro nenhum.
    // Por isso, em cada volta do ciclo:
    //   - preenchemos o que estiver vazio;
    //   - se preenchemos alguma coisa, damos mais uma volta 1 s depois, para ver se ficou;
    //   - só avançamos quando uma volta encontra tudo completo sem mexer em nada.
    async indicarMorada(utilizador: Utilizador) {
        await this.campoPais.selectOption(utilizador.pais);

        await expect(async () => {
            const preenchidos = [
                await this.preencherSeVazio(this.campoCodigoPostal, utilizador.codigoPostal),
                await this.preencherSeVazio(this.campoNumeroPorta, utilizador.numeroPorta),
                await this.preencherSeVazio(this.campoRua, utilizador.rua),
                await this.preencherSeVazio(this.campoCidade, utilizador.cidade),
                await this.preencherSeVazio(this.campoDistrito, utilizador.distrito),
            ];
            expect(preenchidos, 'Preenchi campos nesta volta: confirmo na próxima').not.toContain(true);
            await expect(this.avisoPesquisaMorada).toBeHidden({ timeout: 1_000 });
            await expect(this.botaoAvancarMorada).toBeEnabled({ timeout: 1_000 });
        }).toPass({ intervals: [1_000], timeout: 20_000 });

        await this.botaoAvancarMorada.click();
    }

    // Preenche o campo só se estiver vazio. Devolve true se preencheu.
    private async preencherSeVazio(campo: Locator, valor: string): Promise<boolean> {
        if ((await campo.inputValue()) !== '') return false;
        await campo.fill(valor);
        return true;
    }

    // Etapa 4: escolhe pelo texto que se vê no ecrã ("Cash on Delivery", ...)
    async escolherPagamento(metodo: string, prestacoes?: string) {
        await this.metodoPagamento.selectOption({ label: metodo });
        if (prestacoes) {
            await this.prestacoes.selectOption({ label: prestacoes });
        }
    }

    // O botão "finish" diz sempre "Confirm", mas funciona em DOIS cliques:
    //   1.º clique -> a API valida o pagamento ("Payment was successful")
    //   2.º clique -> cria a encomenda e mostra o número da fatura
    async confirmarEncomenda() {
        await expect(this.botaoFinalizar).toBeEnabled();
        await this.botaoFinalizar.click();
        await expect(this.mensagemPagamentoValido).toBeVisible();

        await expect(this.botaoFinalizar).toHaveText('Confirm');
        await this.botaoFinalizar.click();
    }
}