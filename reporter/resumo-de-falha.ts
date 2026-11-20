// Transforma a mensagem de erro de um teste num resumo curto e legível: sem as linhas
// da pilha ("at ... node_modules ..."), sem cores, sem a assinatura do matcher, sem
// repetições, sem o registo interno das esperas e com as linhas muito longas cortadas.
// Segue a regra do projeto da API (support/resumo-de-falha.cjs), onde tem testes unitários.

const ANSI = /\u001b\[[0-9;]*m/g;
const LARGURA = 160;

export function resumoDaFalha(mensagem: string | undefined): string[] {
    const linhas = String(mensagem ?? '').replace(ANSI, '').split(/\r?\n/);
    const fimDaPilha = linhas.findIndex((l) => /^\s+at /.test(l));

    // A secção "Call log:" é o registo interno do Playwright ("- waiting for ...",
    // "14 × locator resolved to ..."): repete o que as linhas Locator/Expected/Received já
    // dizem. Sai inteira, até à primeira linha em branco, exceto a de tempo esgotado ("exceeded").
    // (As diferenças de listas, "-   \"Pliers\",", ficam fora desta secção e mantêm-se.)
    const semRegisto: string[] = [];
    let noRegisto = false;
    for (const linha of fimDaPilha >= 0 ? linhas.slice(0, fimDaPilha) : linhas) {
        if (/^\s*Call [Ll]og:\s*$/.test(linha)) { noRegisto = true; continue; }
        if (noRegisto && linha.trim() === '') { noRegisto = false; continue; }
        if (noRegisto && !/exceeded/i.test(linha)) continue;
        semRegisto.push(noRegisto ? linha.trim() : linha);
    }

    const uteis = semRegisto
        .map((l) => l.replace(/\s+$/, ''))
        .map((l) => l.replace(/^(\s*)Error: /, '$1'))
        .filter((l) => !/^\s*expect\(.*\)\.\w+\(.*\)/.test(l))
        .map((l) => (l.length > LARGURA ? `${l.slice(0, LARGURA - 1)}…` : l));

    const resultado: string[] = [];
    for (const linha of uteis) {
        const anterior = resultado[resultado.length - 1];
        if (linha.trim() === '' && (anterior === undefined || anterior.trim() === '')) continue;
        if (linha.trim() !== '' && resultado.some((r) => r.trim() === linha.trim())) continue;
        resultado.push(linha);
    }
    while (resultado.length && resultado[resultado.length - 1].trim() === '') resultado.pop();
    return resultado;
}
