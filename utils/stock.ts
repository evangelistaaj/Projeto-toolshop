import { type APIRequestContext, expect } from '@playwright/test';

// Cada encomenda gasta stock. Na Toolshop local, ao fim de muitas execuções, o produto
// esgota e o botão "Add to cart" fica desligado. Por isso, antes de cada cenário de compra,
// repomos o stock pela API, como administrador. No site público NÃO mexemos no catálogo
// (é partilhado): só confirmamos que há stock.

// O mesmo critério do playwright.config.ts para saber se estamos na Toolshop local
const baseURL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
const ambienteLocal = /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(baseURL);
const apiURL = process.env.API_URL
    ?? (ambienteLocal ? 'http://localhost:8091' : 'https://api.practicesoftwaretesting.com');

// Administrador de demonstração da Toolshop (vem nos dados iniciais da aplicação)
const admin = {
    email: process.env.TOOLSHOP_ADMIN_EMAIL ?? 'admin@practicesoftwaretesting.com',
    password: process.env.TOOLSHOP_ADMIN_PASSWORD ?? 'welcome01',
};

type Produto = {
    id: string;
    name: string;
    description: string;
    price: number;
    in_stock: boolean;
    is_location_offer: boolean;
    is_rental: boolean;
    co2_rating: string;
    category: { id: string };
    brand: { id: string };
    product_image: { id: string };
};

export async function garantirStock(request: APIRequestContext, nomeProduto: string, quantidade = 50) {
    const produto = await procurarProduto(request, nomeProduto);

    if (!ambienteLocal) {
        expect(produto.in_stock, `"${nomeProduto}" está sem stock no site público: escolhe outro produto`).toBe(true);
        return;
    }

    const token = await entrarComoAdmin(request);
    // O campo "stock" não aparece na documentação (Swagger), mas a API aceita-o
    const resposta = await request.put(`${apiURL}/products/${produto.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
            name: produto.name,
            description: produto.description,
            price: produto.price,
            category_id: produto.category.id,
            brand_id: produto.brand.id,
            product_image_id: produto.product_image.id,
            is_location_offer: produto.is_location_offer,
            is_rental: produto.is_rental,
            co2_rating: produto.co2_rating,
            stock: quantidade,
        },
    });
    expect(resposta.ok(), `Não consegui repor o stock de "${nomeProduto}" (${resposta.status()})`).toBe(true);
}

async function procurarProduto(request: APIRequestContext, nomeProduto: string): Promise<Produto> {
    const pesquisa = await request.get(`${apiURL}/products/search`, { params: { q: nomeProduto } });
    expect(pesquisa.ok(), `A pesquisa de "${nomeProduto}" na API falhou (${pesquisa.status()})`).toBe(true);
    const corpo = await pesquisa.json();
    const lista: Produto[] = corpo.data ?? corpo;
    // Nome exato: pesquisar "Pliers" também devolve "Combination Pliers"
    const encontrado = lista.find((p) => p.name === nomeProduto);
    expect(encontrado, `O produto "${nomeProduto}" não existe no catálogo`).toBeDefined();

    const detalhe = await request.get(`${apiURL}/products/${encontrado!.id}`);
    expect(detalhe.ok()).toBe(true);
    return detalhe.json();
}

async function entrarComoAdmin(request: APIRequestContext): Promise<string> {
    const resposta = await request.post(`${apiURL}/users/login`, { data: admin });
    expect(resposta.ok(), `O login do administrador falhou (${resposta.status()})`).toBe(true);
    return (await resposta.json()).access_token;
}
