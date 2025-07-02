const fs = require('fs');
const path = require('path');

const URL_ESTRUTURA_ORGANIZACIONAL_RESUMIDA = (codUnidade) => `https://estruturaorganizacional.dados.gov.br/doc/estrutura-organizacional/completa?codigoPoder=1&codigoEsfera=1&codigoUnidade=${codUnidade}&retornarOrgaoEntidadeVinculados=SIM`
const URL_CONSULTA_UNIDADE = (codUnidade) => `https://estruturaorganizacional.dados.gov.br/doc/instancias/consulta-unidade?codigoUnidade=${codUnidade}`

const ORGAOS_SISP = [
    {
        "sigla": "AGU",
        "nome": "Advocacia-Geral da União"
    },
    {
        "sigla": "CC-PR",
        "nome": "Casa Civil da Presidência da República"
    },
    {
        "sigla": "CGU",
        "nome": "Controladoria-Geral da União"
    },
    {
        "sigla": "MAPA",
        "nome": "Ministério da Agricultura e Pecuária"
    },
    {
        "sigla": "MCTI",
        "nome": "Ministério da Ciência, Tecnologia e Inovação"
    },
    {
        "sigla": "MinC",
        "nome": "Ministério da Cultura"
    },
    {
        "sigla": "MD",
        "nome": "Ministério da Defesa"
    },
    {
        "sigla": "MEC",
        "nome": "Ministério da Educação"
    },
    {
        "sigla": "MF",
        "nome": "Ministério da Fazenda"
    },
    {
        "sigla": "MGI",
        "nome": "Ministério da Gestão e da Inovação em Serviços Públicos"
    },
    {
        "sigla": "MIR",
        "nome": "Ministério da Igualdade Racial"
    },
    {
        "sigla": "MIDR",
        "nome": "Ministério da Integração e do Desenvolvimento Regional"
    },
    {
        "sigla": "MJSP",
        "nome": "Ministério da Justiça e Segurança Pública"
    },
    {
        "sigla": "MPA",
        "nome": "Ministério da Pesca e Aquicultura"
    },
    {
        "sigla": "MPS",
        "nome": "Ministério da Previdência Social"
    },
    {
        "sigla": "MS",
        "nome": "Ministério da Saúde"
    },
    {
        "sigla": "MCID",
        "nome": "Ministério das Cidades"
    },
    {
        "sigla": "MCOM",
        "nome": "Ministério das Comunicações"
    },
    {
        "sigla": "MMULHERES",
        "nome": "Ministério das Mulheres"
    },
    {
        "sigla": "MRE",
        "nome": "Ministério das Relações Exteriores"
    },
    {
        "sigla": "MME",
        "nome": "Ministério de Minas e Energia"
    },
    {
        "sigla": "MPOR",
        "nome": "Ministério de Portos e Aeroportos"
    },
    {
        "sigla": "MDA",
        "nome": "Ministério do Desenvolvimento Agrário e Agricultura Familiar"
    },
    {
        "sigla": "MDS",
        "nome": "Ministério do Desenvolvimento e Assistência Social, Família e Combate à Fome"
    },
    {
        "sigla": "MDIC",
        "nome": "Ministério do Desenvolvimento, Indústria, Comércio e Serviços"
    },
    {
        "sigla": "MEMP",
        "nome": "Ministério do Empreendedorismo, da Microempresa e da Empresa de Pequeno Porte"
    },
    {
        "sigla": "MESP",
        "nome": "Ministério do Esporte"
    },
    {
        "sigla": "MMA",
        "nome": "Ministério do Meio Ambiente e Mudança do Clima"
    },
    {
        "sigla": "MPO",
        "nome": "Ministério do Planejamento e Orçamento"
    },
    {
        "sigla": "MTE",
        "nome": "Ministério do Trabalho e Emprego"
    },
    {
        "sigla": "MTur",
        "nome": "Ministério do Turismo"
    },
    {
        "sigla": "MDHC",
        "nome": "Ministério dos Direitos Humanos e da Cidadania"
    },
    {
        "sigla": "MPI",
        "nome": "Ministério dos Povos Indígenas"
    },
    {
        "sigla": "MT",
        "nome": "Ministério dos Transportes"
    }
]

const mapUnidade = (unidades) => {
    return unidades?.map(u => ({sigla: u.sigla, nome: u?.nome, codigoUnidade: u?.codigoUnidade?.split("/")?.pop() ?? '', codigoTipoUnidade: u?.codigoTipoUnidade?.split("/")?.pop() ?? ''}))
}

const cargosUnidade = async (codUnid, nome, level) => {
    if (level > 4) {
        return []
    }
    const cargos = [];
    const req = await fetch(URL_CONSULTA_UNIDADE(codUnid));
    const r = await req.json();
    if (r.unidade?.cargos) {
        cargos.push(r.unidade.cargos.map(c => ({unidade: nome, ...c})));
        console.log('Cargos ' + nome + ': ' + cargos.length)
    }
    const req2 = await fetch(URL_ESTRUTURA_ORGANIZACIONAL_RESUMIDA(codUnid))
    const r2 = await req2.json();
    if (r2.unidades) {
        const subunidades = mapUnidade(r2.unidades);
        for (let i = 0; i < subunidades.length; i++) {
            if (!subunidades[i].codigoUnidade || codUnid === Number(subunidades[i].codigoUnidade)) {
                continue;
            }
            if (subunidades[i].codigoTipoUnidade === 'entidade' || subunidades[i].codigoTipoUnidade === 'entidade') {
                console.log('Subunidade ' + subunidades[i].sigla)
                const cargosUnidTmp = await cargosUnidade(Number(subunidades[i].codigoUnidade), subunidades[i].sigla, level + 1)
                cargos.push(cargosUnidTmp)
            }
        }
    }
    return cargos
}

const iniciar = async () => {
    const req = await fetch(URL_ESTRUTURA_ORGANIZACIONAL_RESUMIDA(26))
    const r = await req.json();
    const unidadesTmp = mapUnidade(r?.unidades?.filter((u) => ORGAOS_SISP.map(o => o.sigla).includes(u.sigla)));


    const unidadesComCollapse = unidadesTmp?.map(u => {
        return { cargos: [], ...u }
    });
    for (let i = 0; i < unidadesComCollapse?.length; i++) {
        if (!unidadesComCollapse?.[i]?.codigoUnidade) {
            continue
        }
        const OUTPUT_JSON = path.join(__dirname, `../resources/${unidadesComCollapse[i].sigla}.json`);
        if (fs.existsSync(OUTPUT_JSON)) {
            console.log(`Arquivo ${unidadesComCollapse[i].sigla}.json já existe, pulando...`);
            continue;
        }
        const codUnid = Number(unidadesComCollapse[i].codigoUnidade);
        console.log('Iniciando ' + unidadesComCollapse[i].sigla)

        const cargos = await cargosUnidade(codUnid, unidadesComCollapse[i].sigla, 0)

        if (cargos) {
            unidadesComCollapse[i].cargos = cargos
        }
        const SAIDA_JSON = path.join(__dirname, `../resources/${unidadesComCollapse[i].sigla}.json`);
        console.log(unidadesComCollapse[i].sigla, cargos.length)
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(unidadesComCollapse), 'utf8');
    }
}

iniciar();