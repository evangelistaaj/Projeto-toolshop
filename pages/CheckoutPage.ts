import { type Page, type Locator, expect } from '@playwright/test';
import { type Utilizador, gerarTransferenciaBancaria, gerarCartaoCredito, gerarCartaoPresente } from '../utils/dados';

export class CheckoutPage {
    // 1. A LISTA dos elementos desta página
    readonly page: Page;

    // Etapa 1: carrinho
    readonly linkCarrinho: Locator;
    readonly botaoAvancarCarrinho: Locator;
    readonly totalCarrinho: Locator;

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
    readonly mensagemErroPagamento: Locator;
    readonly confirmacaoEncomenda: Locator;
    readonly campoNomeBanco: Locator;
    readonly campoNomeConta: Locator;
    readonly campoNumeroConta: Locator;
    readonly campoNumeroCartao: Locator;
    readonly campoValidadeCartao: Locator;
    readonly campoCvv: Locator;
    readonly campoTitularCartao: Locator;
    readonly campoNumeroCartaoPresente: Locator;
    readonly campoCodigoValidacao: Locator;


    // 2. ONDE encontrar cada elemento
    constructor(page: Page) {
        this.page = page;

        // Etapa 1: carrinho
        this.linkCarrinho = page.getByTestId('nav-cart');
        this.botaoAvancarCarrinho = page.getByTestId('proceed-1');
        this.totalCarrinho = page.getByTestId('cart-total');

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
        this.mensagemErroPagamento = page.getByTestId('payment-error-message');
        this.campoNomeBanco = page.getByTestId('bank_name');
        this.campoNomeConta = page.getByTestId('account_name');
        this.campoNumeroConta = page.getByTestId('account_number');
        this.campoNumeroCartao = page.getByTestId('credit_card_number');
        this.campoValidadeCartao = page.getByTestId('expiration_date');
        this.campoCvv = page.getByTestId('cvv');
        this.campoTitularCartao = page.getByTestId('card_holder_name');
        this.campoNumeroCartaoPresente = page.getByTestId('gift_card_number');
        this.campoCodigoValidacao = page.getByTestId('validation_code');

        // A confirmação final
        this.confirmacaoEncomenda = page.locator('#order-confirmation');
    }

    // 3. AÇÕES que se podem fazer nesta página

    // Etapa 1: o cliente abre o carrinho pelo ícone, como na exploração
    async abrirCarrinho() {
        await this.linkCarrinho.click();
        await expect(this.botaoAvancarCarrinho).toBeVisible();
    }

    // ... e avança para o checkout
    async abrirPeloCarrinho() {
        await this.abrirCarrinho();
        await this.botaoAvancarCarrinho.click();
    }

    // A linha do carrinho de um produto (nome exato: "Pliers" não apanha "Combination Pliers")
    linhaProduto(produto: string): Locator {
        return this.page.getByRole('row').filter({
            has: this.page.getByTestId('product-title').filter({ hasText: new RegExp(`^\\s*${produto}\\s*$`) }),
        });
    }

    precoProduto(produto: string): Locator {
        return this.linhaProduto(produto).getByTestId('product-price');
    }

    // O campo da quantidade tem um rótulo acessível com o nome do produto
    async alterarQuantidade(produto: string, quantidade: number) {
        const respostaQuantidade = this.page.waitForResponse(
            (r) => r.url().includes('/product/quantity') && r.request().method() === 'PUT',
        );
        const campoQuantidade = this.page.getByLabel(`Quantity for ${produto}`);
        await campoQuantidade.fill(String(quantidade));
        await campoQuantidade.blur(); // a Toolshop só atualiza quando o campo perde o foco
        await respostaQuantidade;
    }

    async removerProduto(produto: string) {
        const respostaRemover = this.page.waitForResponse(
            (r) => r.url().includes('/carts/') && r.request().method() === 'DELETE',
        );
        // O botão de remover não tem data-test nem nome acessível (só um ícone "x"):
        // CSS é a única forma de o encontrar. É também uma falha de acessibilidade.
        await this.linhaProduto(produto).locator('a.btn-danger').click();
        await respostaRemover;
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

    // Etapa 2, como convidado: preenche e submete os dados (sem avançar)
    async preencherConvidado(utilizador: Utilizador) {
        await this.separadorConvidado.click();
        await this.campoEmailConvidado.fill(utilizador.email);
        await this.campoNomeConvidado.fill(utilizador.nome);
        await this.campoApelidoConvidado.fill(utilizador.apelido);
        await this.botaoConfirmarConvidado.click();
    }

    // ... e avança para a morada
    async continuarComoConvidado(utilizador: Utilizador) {
        await this.preencherConvidado(utilizador);
        await expect(this.botaoAvancarConvidado).toBeEnabled();
        await this.botaoAvancarConvidado.click();
    }

    // Uma mensagem de validação, pelo texto que se vê no ecrã
    aviso(texto: string): Locator {
        return this.page.getByText(texto);
    }

    // Etapa 3: morada.
    // Como funciona a Toolshop (visto no código dela):
    //   - 300 ms depois de mudares o código postal OU o número da porta, faz uma
    //     pesquisa de morada; se mudares os dois, pode fazer DUAS;
    //   - a resposta reescreve rua, cidade e distrito, e o distrito vem vazio (bug #2);
    //   - com conta, a morada do registo já vem preenchida, menos o número da porta;
    //   - a API só aceita a cidade que a pesquisa devolve para aquele código postal:
    //     com outra cidade qualquer, recusa a encomenda (422, "city does not belong...").
    // Se avançarmos com o distrito vazio ou com outra cidade, a encomenda é recusada
    // no fim (422) e o ecrã não mostra erro nenhum.
    // Por isso, em cada volta do ciclo:
    //   - primeiro o código postal e o número; se mexemos neles, esperamos pela pesquisa
    //     (próxima volta, 1 s depois) antes de tocar na rua e na cidade;
    //   - depois preenchemos o que a pesquisa deixou vazio (o distrito, sempre);
    //   - só avançamos quando uma volta encontra tudo completo sem mexer em nada.
    async preencherMorada(utilizador: Utilizador) {
        await this.campoPais.selectOption(utilizador.pais);

        await expect(async () => {
            const preenchiCodigo = [
                await this.preencherSeVazio(this.campoCodigoPostal, utilizador.codigoPostal),
                await this.preencherSeVazio(this.campoNumeroPorta, utilizador.numeroPorta),
            ];
            expect(preenchiCodigo, 'Mudei o código postal ou o número: espero pela pesquisa').not.toContain(true);
            await expect(this.avisoPesquisaMorada).toBeHidden({ timeout: 1_000 });

            const preenchidos = [
                await this.preencherSeVazio(this.campoRua, utilizador.rua),
                await this.preencherSeVazio(this.campoCidade, utilizador.cidade),
                await this.preencherSeVazio(this.campoDistrito, utilizador.distrito),
            ];
            expect(preenchidos, 'Preenchi campos nesta volta: confirmo na próxima').not.toContain(true);
            await expect(this.botaoAvancarMorada).toBeEnabled({ timeout: 1_000 });
        }).toPass({ intervals: [1_000], timeout: 20_000 });
    }

    // Morada completa e estável: avança para o pagamento
    async indicarMorada(utilizador: Utilizador) {
        await this.preencherMorada(utilizador);
        await this.botaoAvancarMorada.click();
    }

    // Cenário negativo: a morada fica sem rua (a pesquisa já terminou, nada a volta a preencher)
    async indicarMoradaSemRua(utilizador: Utilizador) {
        await this.preencherMorada(utilizador);
        await this.campoRua.clear();
        await this.campoRua.blur();
    }

    // Cenário do bug #4: troca a cidade que a pesquisa devolveu por outra e avança.
    // O formulário aceita, mas a API vai recusar a fatura no fim (422).
    async indicarMoradaComOutraCidade(utilizador: Utilizador, cidade: string) {
        await this.preencherMorada(utilizador);
        await this.campoCidade.fill(cidade);
        await expect(this.botaoAvancarMorada).toBeEnabled();
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

        switch (metodo) {
            case 'Cash on Delivery':
                // não pede mais nada
                break;

            case 'Buy Now Pay Later':
                await this.prestacoes.selectOption({ label: prestacoes ?? '3 Monthly Installments' });
                break;

            case 'Bank Transfer':
                const transferencia = gerarTransferenciaBancaria();
                await this.campoNomeBanco.fill(transferencia.nomeBanco);
                await this.campoNomeConta.fill(transferencia.nomeConta);
                await this.campoNumeroConta.fill(transferencia.numeroConta);
                break;

            case 'Credit Card':
                const cartao = gerarCartaoCredito();
                await this.campoNumeroCartao.fill(cartao.numero);
                await this.campoValidadeCartao.fill(cartao.validade);
                await this.campoCvv.fill(cartao.cvv);
                await this.campoTitularCartao.fill(cartao.titular);
                break;

            case 'Gift Card':
                const cartaoPresente = gerarCartaoPresente();
                await this.campoNumeroCartaoPresente.fill(cartaoPresente.numero);
                await this.campoCodigoValidacao.fill(cartaoPresente.codigoValidacao);
                break;

            default:
                throw new Error(`Método de pagamento desconhecido: "${metodo}"`);
        }
    }

    // Cenários negativos: troca um campo do cartão (já preenchido com dados válidos)
    // por um valor inválido. Nomes como aparecem no Gherkin.
    async alterarCampoCartao(campo: string, valor: string) {
        let campoCartao: Locator;
        switch (campo) {
            case 'número':
                campoCartao = this.campoNumeroCartao;
                break;
            case 'validade':
                campoCartao = this.campoValidadeCartao;
                break;
            case 'CVV':
                campoCartao = this.campoCvv;
                break;
            default:
                throw new Error(`Campo do cartão desconhecido: "${campo}"`);
        }
        await campoCartao.fill(valor);
        await campoCartao.blur(); // a mensagem de erro aparece quando o campo perde o foco
    }

    // O número da fatura que aparece na confirmação ("... INV-2026000119.")
    async lerNumeroFatura(): Promise<string> {
        const texto = (await this.confirmacaoEncomenda.textContent()) ?? '';
        const numero = texto.match(/INV-\d+/)?.[0];
        if (!numero) throw new Error(`Não encontrei o número da fatura em: "${texto}"`);
        return numero;
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