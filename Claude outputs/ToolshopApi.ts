import { expect, type APIRequestContext } from '@playwright/test';
import { gerarDadosDeUtilizador } from './dadosDeTeste';

export type Conta = { email: string; password: string };

/**
 * Acesso direto à API da Toolshop para preparar dados de teste,
 * sem passar pela interface (mais rápido e mais estável).
 * Campos confirmados em sprint5/API/app/Http/Requests/Customer/StoreCustomer.php.
 */
export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  async criarConta(): Promise<Conta> {
    const dados = gerarDadosDeUtilizador();

    const resposta = await this.request.post('/users/register', { data: dados });

    expect(resposta.status(), `Registo via API falhou: ${await resposta.text()}`).toBe(201);
    return { email: dados.email, password: dados.password };
  }
}
