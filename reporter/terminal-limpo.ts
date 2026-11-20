import type { FullResult, Reporter, Suite, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import path from 'node:path';
import { resumoDaFalha } from './resumo-de-falha';

// Reporter do Playwright para o terminal, igual ao do projeto da API: um sinal por teste
// enquanto corre e, no fim, cada falha num bloco curto (browser, cenário, ficheiro, passo e
// o erro sem a pilha), com a pasta das evidências numa linha. O relatório HTML continua
// completo (npm run relatorio). Usado em playwright.config.ts.
//
// Sinais: · passou (ou falhou como esperado, @fail)   × falhou e vai ser repetido
//         F falhou   ± passou à segunda (instável)     ° ignorado

const cor = (codigo: number) => (texto: string) => (process.stdout.isTTY ? `\u001b[${codigo}m${texto}\u001b[39m` : texto);
const vermelho = cor(31);
const verde = cor(32);
const amarelo = cor(33);
const cinzento = cor(90);

export default class TerminalLimpo implements Reporter {
    private raiz!: Suite;
    private inicio = Date.now();
    private sinais = 0;
    private terminados = 0;
    private total = 0;
    // No terminal, uma linha de sinais vai até 80. Na CI (sem terminal), o log só mostra
    // uma linha quando ela acaba: linhas de 10 sinais, com a contagem, para se ver o progresso.
    private readonly porLinha = process.stdout.isTTY ? 80 : 10;

    printsToStdio() {
        return true;
    }

    onBegin(_config: unknown, suite: Suite) {
        this.raiz = suite;
        this.total = suite.allTests().length;
        process.stdout.write(`A correr ${this.total} testes\n`);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const vaiRepetir = result.status !== 'passed' && result.status !== 'skipped' && result.retry < test.retries && test.outcome() === 'unexpected';
        let sinal: string;
        if (vaiRepetir) sinal = amarelo('×');
        else if (test.outcome() === 'expected') sinal = verde('·');
        else if (test.outcome() === 'flaky') sinal = amarelo('±');
        else if (test.outcome() === 'skipped') sinal = cinzento('°');
        else sinal = vermelho('F');
        process.stdout.write(sinal);
        if (!vaiRepetir) this.terminados++;
        if (++this.sinais % this.porLinha === 0) {
            process.stdout.write(process.stdout.isTTY ? '\n' : `  ${this.terminados}/${this.total}\n`);
        }
    }

    onEnd(resultado: FullResult) {
        const testes = this.raiz.allTests();
        const falhas = testes.filter((t) => t.outcome() === 'unexpected');
        const instaveis = testes.filter((t) => t.outcome() === 'flaky');
        const passaram = testes.filter((t) => t.outcome() === 'expected').length;
        const ignorados = testes.filter((t) => t.outcome() === 'skipped').length;

        process.stdout.write('\n\n');
        falhas.forEach((teste, i) => {
            const ultimo = teste.results[teste.results.length - 1];
            this.bloco(`${i + 1}) ${this.titulo(teste)}`, teste, ultimo, vermelho);
        });
        for (const teste of instaveis) {
            process.stdout.write(amarelo(`± Instável (passou à ${teste.results.length}.ª tentativa): ${this.titulo(teste)}\n`));
        }
        if (instaveis.length) process.stdout.write('\n');

        const segundos = ((Date.now() - this.inicio) / 1000).toFixed(1).replace('.', ',');
        const partes = [verde(`✓ ${passaram} a passar`), (falhas.length ? vermelho : (t: string) => t)(`✗ ${falhas.length} a falhar`)];
        if (instaveis.length) partes.push(amarelo(`± ${instaveis.length} instáveis`));
        if (ignorados) partes.push(`° ${ignorados} ignorados`);
        process.stdout.write(`${partes.join('   ')}   (${segundos} s)\n`);
        if (falhas.length) process.stdout.write(cinzento('Relatório completo: npm run relatorio\n'));
        if (resultado.status === 'timedout') process.stdout.write(vermelho('A execução parou: tempo total esgotado.\n'));
    }

    // "[firefox] Checkout › Comprar com pagamento na entrega", sem o nome do ficheiro gerado
    private titulo(teste: TestCase): string {
        const projeto = teste.parent.project()?.name;
        const partes = teste.titlePath().filter((t) => t && !t.endsWith('.spec.js') && t !== projeto);
        return `${projeto ? `[${projeto}] ` : ''}${partes.join(' › ')}`;
    }

    private bloco(cabecalho: string, teste: TestCase, resultado: TestResult, pintar: (t: string) => string) {
        process.stdout.write(pintar(`✗ ${cabecalho}`) + '\n');
        // O ficheiro gerado (.features-gen/features/x.feature.spec.js) aponta para o .feature
        const ficheiro = teste.location.file.replace(/\\/g, '/').replace(/^.*\.features-gen\//, '').replace(/\.spec\.js$/, '');
        process.stdout.write(`     ${ficheiro}\n`);
        const passo = this.passoQueFalhou(resultado.steps);
        if (passo) process.stdout.write(`     Passo: ${passo.title}\n`);
        // Um cenário @fail (bug conhecido) que passou: não há erro para mostrar, por isso
        // explicamos o que aconteceu. Normalmente quer dizer que o bug foi corrigido.
        if (teste.expectedStatus === 'failed' && resultado.status === 'passed') {
            process.stdout.write('     Esperava falhar (@fail, bug conhecido) e passou: o bug foi corrigido?\n');
            process.stdout.write('     Se sim, tira o @fail e fecha o issue.\n');
        }
        for (const linha of resumoDaFalha(resultado.error?.message)) process.stdout.write(linha.trim() ? `     ${linha}\n` : '\n');
        const evidencia = resultado.attachments.find((a) => a.path)?.path;
        if (evidencia) process.stdout.write(cinzento(`     Evidências: ${path.relative(process.cwd(), path.dirname(evidencia))}\n`));
        process.stdout.write('\n');
    }

    // O passo do Gherkin mais interior com erro (o playwright-bdd cria um passo por linha do cenário)
    private passoQueFalhou(passos: TestStep[]): TestStep | undefined {
        for (const passo of passos) {
            if (passo.category === 'test.step' && passo.error) {
                return this.passoQueFalhou(passo.steps.filter((p) => p.category === 'test.step')) ?? passo;
            }
        }
        return undefined;
    }
}
