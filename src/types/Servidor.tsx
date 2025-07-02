export type Servidor = {
    idComFlagExisteDetalhamentoServidor: string;
    tipo: string;
    nome: string;
    numRanking: string;
    orgaoSuperiorServidorLotacao: string;
    orgaoServidorLotacao: string;
    situacao: string;
    cargo: string;
    atividade: string;
    funcao: string;
}

export type Servidores = {
    recordsTotal: number;
    recordsFiltered: number;
    data: Servidor[]
}