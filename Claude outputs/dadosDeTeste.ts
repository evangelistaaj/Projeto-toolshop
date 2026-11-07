import { randomUUID } from 'node:crypto';

export type Morada = {
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string; // código ISO de 2 letras (valor do <select> de país)
  postal_code: string;
};

export type DadosUtilizador = {
  first_name: string;
  last_name: string;
  dob: string; // AAAA-MM-DD
  phone: string; // só dígitos
  email: string;
  password: string;
  address: Morada;
};

/**
 * Dados válidos e únicos para criar um utilizador, pela API ou pela interface.
 *
 * Regras confirmadas no código-fonte da Toolshop (sprint5):
 * - idade entre 18 e 75 anos
 * - telefone só com dígitos
 * - password com 8+ caracteres, maiúsculas, minúsculas, números e símbolos,
 *   e que não conste de fugas de dados conhecidas (por isso é aleatória)
 * - email único (por isso leva timestamp + id aleatório)
 * - código postal válido para o país (PT: 0000-000)
 */
export function gerarDadosDeUtilizador(): DadosUtilizador {
  const id = randomUUID();
  return {
    first_name: 'Teste',
    last_name: 'Automatico',
    dob: '1990-01-01',
    phone: '912345678',
    email: `qa-${Date.now()}-${id.slice(0, 8)}@teste.com`,
    password: `Qa!${id.slice(0, 12)}Z9`,
    address: {
      street: 'Rua de Teste',
      house_number: '1',
      city: 'Lisboa',
      state: 'Lisboa',
      country: 'PT',
      postal_code: '1000-001',
    },
  };
}
