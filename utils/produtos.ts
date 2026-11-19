import { type APIRequestContext, expect } from '@playwright/test';
import { ambienteLocal, apiURL, entrarComoAdmin } from './stock';

// Produtos criados para um cenário, com o preço e a classificação CO2 que o cenário pede.
// Assim o cenário não depende do catálogo de demonstração (preços e classificações podem mudar).
// Só na Toolshop local: no site público não se mexe no catálogo, porque é partilhado.

export type ProdutoCriado = {
    id: string;
    nome: string; // o nome completo, com a referência única
};

// Uma referência única, como as de um catálogo real (ex.: "MHO7X2K9A3F")
function referenciaUnica(): string {
    return (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase();
}

// Categoria, marca e imagem: qualquer uma serve. Os ids vêm da API, porque mudam
// sempre que se repõem os dados.
async function primeiroId(request: APIRequestContext, caminho: string): Promise<string> {
    const resposta = await request.get(`${apiURL}${caminho}`);
    expect(resposta.ok(), `Não consegui obter ${caminho} (${resposta.status()})`).toBe(true);
    const lista = await resposta.json();
    return lista[0].id;
}

export async function criarProduto(
    request: APIRequestContext,
    nome: string,
    preco: number,
    co2: string,
): Promise<ProdutoCriado> {
    if (!ambienteLocal) {
        throw new Error('Criar produtos só é permitido na Toolshop local (BASE_URL em localhost). Falta a tag @so-local?');
    }
    const token = await entrarComoAdmin(request);
    // Nome único: cada execução (e cada browser) tem os seus produtos
    const nomeCompleto = `${nome} - ref. ${referenciaUnica()}`;
    const resposta = await request.post(`${apiURL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
            name: nomeCompleto,
            description: 'Tool from the Toolshop catalog.',
            price: preco,
            category_id: await primeiroId(request, '/categories'),
            brand_id: await primeiroId(request, '/brands'),
            product_image_id: await primeiroId(request, '/images'),
            is_location_offer: false,
            is_rental: false,
            co2_rating: co2,
            stock: 50, // não aparece na documentação (Swagger), mas a API aceita-o
        },
    });
    expect(resposta.status(), `Não consegui criar o produto "${nome}": ${await resposta.text()}`).toBe(201);
    return { id: (await resposta.json()).id, nome: nomeCompleto };
}

// Limpeza no fim do cenário (ver steps/fixtures.ts)
export async function apagarProdutos(request: APIRequestContext, produtos: ProdutoCriado[]) {
    if (produtos.length === 0) return;
    const token = await entrarComoAdmin(request);
    for (const produto of produtos) {
        const resposta = await request.delete(`${apiURL}/products/${produto.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        // 409: o produto já foi comprado (está numa fatura) e não pode ser apagado.
        // Fica na base de dados até à próxima reposição dos dados.
        if (![204, 404, 409].includes(resposta.status())) {
            console.warn(`Limpeza: não consegui apagar "${produto.nome}" (${resposta.status()})`);
        }
    }
}
