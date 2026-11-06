import { type Page, type Locator, expect } from '@playwright/test';
import { type Utilizador } from '../utils/dados';

export class RegisterPage {
    readonly page: Page;
    readonly campoNome: Locator;
    readonly campoApelido: Locator;
    readonly campoDataNascimento: Locator;
    readonly campoPais: Locator;
    readonly campoCodigoPostal: Locator;
    readonly campoNumeroPorta: Locator;
    readonly campoRua: Locator;
    readonly campoCidade: Locator;
    readonly campoDistrito: Locator;
    readonly campoTelefone: Locator;
    readonly campoEmail: Locator;
    readonly campoPassword: Locator;
    readonly botaoRegistar: Locator;
    readonly titulo: Locator;
    readonly loadingMorada: Locator;

    constructor(page: Page) {
        this.page = page;
        this.campoNome = page.getByTestId('first-name');
        this.campoApelido = page.getByTestId('last-name');
        this.campoDataNascimento = page.getByTestId('dob');
        this.campoPais = page.getByTestId('country');
        this.campoCodigoPostal = page.getByTestId('postal_code');
        this.campoNumeroPorta = page.getByTestId('house_number');
        this.campoRua = page.getByTestId('street');
        this.campoCidade = page.getByTestId('city');
        this.campoDistrito = page.getByTestId('state');
        this.campoTelefone = page.getByTestId('phone');
        this.campoEmail = page.getByTestId('email');
        this.campoPassword = page.getByTestId('password');
        this.botaoRegistar = page.getByTestId('register-submit');
        this.titulo = page.getByRole('heading', { name: 'Customer registration' });
        this.loadingMorada = page.getByText('Looking up your address');
    }

    async abrir() {
        await this.page.goto('/auth/register');
        await expect(this.titulo).toBeVisible();
    }

    async registar(utilizador: Utilizador) {
        await this.campoNome.fill(utilizador.nome);
        await this.campoApelido.fill(utilizador.apelido);
        await this.campoDataNascimento.fill(utilizador.dataNascimento);

        // 1. Escutar a procura da morada antes de a disparar
        const procuraMorada = this.page.waitForResponse(resposta =>
            resposta.url().includes('postcode-lookup') &&
            resposta.url().includes(`house_number=${encodeURIComponent(utilizador.numeroPorta)}`)
        );

        // 2. Os campos que disparam a procura
        await this.campoPais.selectOption(utilizador.pais);
        await this.campoCodigoPostal.fill(utilizador.codigoPostal);
        await this.campoNumeroPorta.fill(utilizador.numeroPorta);

        // 3. Esperar que a procura termine e que o site preencha a morada
        await procuraMorada;
        await expect(this.loadingMorada).toBeHidden();

        // 4. A rua e a cidade vêm do código postal: confirmamos que o site as preencheu
        await expect(this.campoRua).not.toHaveValue('');
        await expect(this.campoCidade).not.toHaveValue('');

        // 5. O distrito: só preenchemos se o site o deixar vazio
        if ((await this.campoDistrito.inputValue()) === '') {
            await this.campoDistrito.fill(utilizador.distrito);
        }

        await this.campoTelefone.fill(utilizador.telefone);
        await this.campoEmail.fill(utilizador.email);
        await this.campoPassword.fill(utilizador.password);

        await this.botaoRegistar.click();
    }
}