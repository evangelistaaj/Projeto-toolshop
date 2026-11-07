import { expect, type Locator, type Page } from '@playwright/test';
import type { DadosUtilizador } from '../support/dadosDeTeste';

/**
 * Página de registo da Toolshop (/auth/register).
 * Seletores confirmados em sprint5/UI/src/app/auth/register/register.component.html.
 */
export class RegistoPage {
  readonly campoNome: Locator;
  readonly campoApelido: Locator;
  readonly campoDataNascimento: Locator;
  readonly seletorPais: Locator;
  readonly campoCodigoPostal: Locator;
  readonly campoNumeroPorta: Locator;
  readonly avisoPesquisaMorada: Locator;
  readonly campoRua: Locator;
  readonly campoCidade: Locator;
  readonly campoDistrito: Locator;
  readonly campoTelefone: Locator;
  readonly campoEmail: Locator;
  readonly campoPassword: Locator;
  readonly botaoRegistar: Locator;
  readonly mensagemDeErro: Locator;

  constructor(private readonly page: Page) {
    this.campoNome = page.getByTestId('first-name');
    this.campoApelido = page.getByTestId('last-name');
    this.campoDataNascimento = page.getByTestId('dob');
    this.seletorPais = page.getByTestId('country');
    this.campoCodigoPostal = page.getByTestId('postal_code');
    this.campoNumeroPorta = page.getByTestId('house_number');
    this.avisoPesquisaMorada = page.getByTestId('postcode-lookup-loading');
    this.campoRua = page.getByTestId('street');
    this.campoCidade = page.getByTestId('city');
    this.campoDistrito = page.getByTestId('state');
    this.campoTelefone = page.getByTestId('phone');
    this.campoEmail = page.getByTestId('email');
    this.campoPassword = page.getByTestId('password');
    this.botaoRegistar = page.getByTestId('register-submit');
    this.mensagemDeErro = page.getByTestId('register-error');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/auth/register');
    await this.campoNome.waitFor();
  }

  async registar(dados: DadosUtilizador): Promise<void> {
    await this.campoNome.fill(dados.first_name);
    await this.campoApelido.fill(dados.last_name);
    await this.campoDataNascimento.fill(dados.dob);
    await this.preencherMorada(dados);
    await this.campoTelefone.fill(dados.phone);
    await this.campoEmail.fill(dados.email);
    await this.campoPassword.fill(dados.password);
    await this.botaoRegistar.click();
  }

  /**
   * Quando país, código postal e número da porta estão preenchidos, a Toolshop
   * pesquisa a morada e pode reescrever rua, cidade e distrito. Por isso:
   * 1. preenchemos primeiro esses três campos;
   * 2. esperamos que a pesquisa termine;
   * 3. só depois escrevemos rua, cidade e distrito e confirmamos que ficaram.
   */
  private async preencherMorada(dados: DadosUtilizador): Promise<void> {
    const { address: morada } = dados;
    await this.seletorPais.selectOption(morada.country);
    await this.campoCodigoPostal.fill(morada.postal_code);
    await this.campoNumeroPorta.fill(morada.house_number);
    await expect(this.avisoPesquisaMorada).toBeHidden();

    await this.campoRua.fill(morada.street);
    await this.campoCidade.fill(morada.city);
    await this.campoDistrito.fill(morada.state);
    await expect(this.campoRua).toHaveValue(morada.street);
    await expect(this.campoCidade).toHaveValue(morada.city);
    await expect(this.campoDistrito).toHaveValue(morada.state);
  }
}
