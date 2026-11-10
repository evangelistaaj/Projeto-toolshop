import { fakerPT_PT as faker } from '@faker-js/faker';

// O "molde" de um utilizador: que campos tem e de que tipo
export type Utilizador = {
    nome: string;
    apelido: string;
    dataNascimento: string;
    pais: string;
    codigoPostal: string;
    numeroPorta: string;
    rua: string;
    cidade: string;
    distrito: string;
    telefone: string;
    email: string;
    password: string;
};

// A "fábrica": cada chamada devolve um utilizador novo e válido
export function gerarUtilizador(): Utilizador {
    return {
        nome: faker.person.firstName(),
        apelido: faker.person.lastName(),
        dataNascimento: faker.date.birthdate({ mode: 'age', min: 18, max: 70 }).toISOString().split('T')[0],
        pais: 'PT',
        codigoPostal: faker.location.zipCode('####-###'),
        numeroPorta: faker.location.buildingNumber(),
        rua: faker.location.street(),
        cidade: faker.location.city(),
        distrito: faker.helpers.arrayElement(['Lisboa', 'Porto', 'Setúbal', 'Braga', 'Aveiro', 'Coimbra', 'Faro', 'Viseu', 'Évora', 'Leiria']),
        telefone: '9' + faker.string.numeric(8),
        // Email único: data/hora + letras aleatórias
        email: `teste.${Date.now()}.${faker.string.alphanumeric(6).toLowerCase()}@exemplo.com`,
        // Password que cumpre as regras: 4 maiúsculas + 4 minúsculas + 3 números + símbolo
        password: `${faker.string.alpha({ length: 4, casing: 'upper' })}${faker.string.alpha({ length: 4, casing: 'lower' })}${faker.string.numeric(3)}!`,
    };
}

// ---------- Dados de pagamento ----------
// As regras vêm da tua exploração e confirmei-as no código da Toolshop (os padrões que
// a página usa para validar cada campo). Os campos só aceitam letras SEM acentos,
// por isso os nomes do faker pt_PT passam pelo semAcentos().

export type TransferenciaBancaria = {
    nomeBanco: string;   // letras e espaços, 3 a 10
    nomeConta: string;   // letras, números, espaços, . ' -, 3 a 10
    numeroConta: string; // só números, 3 a 10
};

export type CartaoCredito = {
    numero: string;   // 0000-0000-0000-0000
    validade: string; // MM/AAAA, sempre no futuro
    cvv: string;      // 3 ou 4 números
    titular: string;  // nome e apelido, só letras e espaço, 3 a 10
};

export type CartaoPresente = {
    numero: string;          // 16 letras ou números
    codigoValidacao: string; // 4 letras ou números
};

export function gerarTransferenciaBancaria(): TransferenciaBancaria {
    return {
        nomeBanco: faker.helpers.arrayElement(['Millennium', 'Novo Banco', 'Santander', 'Montepio', 'Bankinter', 'Caixa', 'BPI']),
        nomeConta: semAcentos(faker.person.firstName()).slice(0, 10).padEnd(3, 'a'),
        numeroConta: faker.string.numeric({ length: { min: 3, max: 10 } }),
    };
}

export function gerarCartaoCredito(): CartaoCredito {
    // Validade: entre 1 e 60 meses a partir de hoje (dia 1, para não saltar meses)
    const validade = new Date();
    validade.setDate(1);
    validade.setMonth(validade.getMonth() + faker.number.int({ min: 1, max: 60 }));

    return {
        numero: Array.from({ length: 4 }, () => faker.string.numeric(4)).join('-'),
        validade: `${String(validade.getMonth() + 1).padStart(2, '0')}/${validade.getFullYear()}`,
        cvv: faker.string.numeric({ length: { min: 3, max: 4 } }),
        titular: gerarTitularCurto(),
    };
}

export function gerarCartaoPresente(): CartaoPresente {
    return {
        numero: faker.string.alphanumeric(16),
        codigoValidacao: faker.string.alphanumeric(4),
    };
}

// "Ana Sousa", "Rui Lopes"...: tenta até sair um nome e apelido com 10 caracteres no máximo
function gerarTitularCurto(): string {
    for (let tentativa = 0; tentativa < 50; tentativa++) {
        const titular = `${semAcentos(faker.person.firstName())} ${semAcentos(faker.person.lastName())}`;
        if (titular.length >= 3 && titular.length <= 10) return titular;
    }
    return 'Ana Silva';
}

// "Gonçalo" -> "Goncalo", "Sónia" -> "Sonia"; e fica só com letras
function semAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z]/g, '');
}
