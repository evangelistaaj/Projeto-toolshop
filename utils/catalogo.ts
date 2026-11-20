import { type APIRequestContext, expect } from '@playwright/test';
import { apiURL } from './stock';

// O oráculo dos filtros de categoria: a própria API da Toolshop, no ambiente onde o teste corre.
// Porquê: o site público é partilhado (outras pessoas criam produtos, por exemplo
// "Product-20261120-27a304" na categoria Pliers) e os dados de demonstração da imagem Docker
// não são iguais aos do site público (17 produtos em "Other", contra 15). Uma lista fixa só
// serve num ambiente; a resposta da API serve em todos e continua a ser uma lista exata.
//
// O pedido à API leva EXATAMENTE os filtros que a interface envia (código da Toolshop:
// products/overview e _services/product.service.ts): categoria (com as subcategorias),
// ordem, página, o intervalo de preço do slider, que é SEMPRE enviado (por omissão de
// $1 a $100, mesmo sem o cliente lhe tocar), e is_rental=false (os alugueres têm página
// própria). Sem o preço, a API devolvia 2 produtos de "Other" que custam mais de $100
// (Wooden Workbench e Workbench with Drawers) e que a interface, com razão, não mostra.

// O intervalo de preço da interface quando o cliente não mexe no slider
export const PRECO_POR_OMISSAO = { min: 1, max: 100 };

type Categoria = { id: string; name: string; sub_categories?: Categoria[] };

export type Filtro = {
    categoria?: string; // nome da categoria, como na interface (ex.: "Pliers")
    ordenacao?: string; // valor do parâmetro "sort" (ex.: "name,asc")
    pagina?: number;
    preco?: { min: number; max: number }; // o intervalo do slider; por omissão, PRECO_POR_OMISSAO
};

// A categoria e todas as subcategorias: a interface marca as subcategorias
// quando se escolhe uma categoria (ex.: "Other" marca "Tool Belts", "Fasteners"...).
function idsDaCategoria(arvore: Categoria[], nome: string): string[] {
    const ids = (no: Categoria): string[] => [no.id, ...(no.sub_categories ?? []).flatMap(ids)];
    for (const no of arvore) {
        if (no.name === nome) return ids(no);
        const encontrados = idsDaCategoria(no.sub_categories ?? [], nome);
        if (encontrados.length) return encontrados;
    }
    return [];
}

// Os nomes dos produtos que a API devolve para o mesmo filtro, ordem e página da interface.
export async function produtosDaApi(request: APIRequestContext, filtro: Filtro): Promise<string[]> {
    if (!filtro.categoria) {
        throw new Error('Nenhuma categoria filtrada neste cenário. Falta o passo "Quando filtro pela categoria ..."?');
    }
    const arvore = await request.get(`${apiURL}/categories/tree`);
    expect(arvore.ok(), `A árvore de categorias da API falhou (${arvore.status()})`).toBe(true);
    const ids = idsDaCategoria(await arvore.json(), filtro.categoria);
    expect(ids.length, `A categoria "${filtro.categoria}" não existe na API`).toBeGreaterThan(0);

    const { min, max } = filtro.preco ?? PRECO_POR_OMISSAO;
    const params: Record<string, string | number> = {
        by_category: ids.join(','),
        between: `price,${min},${max}`,
        is_rental: 'false',
        page: filtro.pagina ?? 1,
    };
    if (filtro.ordenacao) params.sort = filtro.ordenacao;
    const resposta = await request.get(`${apiURL}/products`, { params });
    expect(resposta.ok(), `A lista de produtos da API falhou (${resposta.status()})`).toBe(true);
    const produtos: { name: string; category: { id: string } }[] = (await resposta.json()).data;

    // O oráculo também é verificado: uma API que ignorasse o filtro daria uma lista
    // "igual" à da interface pelas razões erradas.
    expect(produtos.length, 'a API não devolveu produtos para este filtro').toBeGreaterThan(0);
    const deFora = produtos.filter((p) => !ids.includes(p.category.id)).map((p) => p.name);
    expect(deFora, `produtos de fora da categoria "${filtro.categoria}" na resposta da API`).toEqual([]);

    return produtos.map((p) => p.name.trim());
}
