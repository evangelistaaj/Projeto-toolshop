import { Given } from './fixtures';
import { garantirStock } from '../utils/stock';

// Pré-condição de dados para os cenários de compra (ver utils/stock.ts):
// na Toolshop local repõe o stock pela API; no site público só confirma que há stock.
Given('que o produto {string} tem stock', async ({ request }, produto: string) => {
    await garantirStock(request, produto);
});
