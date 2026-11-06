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