const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const porta = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function processarDados() {
    return new Promise((resolve, reject) => {
        const remuneracoes = [];
        const servidores = [];

        const promessaRemuneracoes = new Promise((res, rej) => {
            fs.createReadStream(path.join(__dirname, 'data', '202505_Remuneracao_pub.csv'), { encoding: 'UTF-8' })
                .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.trim() }))
                .on('data', (row) => {
                    const remuneracaoBruta = parseFloat(row[Object.keys(row)[5]]?.replace(',', '.') || 0);
                    if (row['Id_SERVIDOR_PORTAL'] && !isNaN(remuneracaoBruta)) {
                        remuneracoes.push({
                            idServidor: row['Id_SERVIDOR_PORTAL'],
                            remuneracaoBruta: remuneracaoBruta
                        });
                    }
                })
                .on('end', () => res())
                .on('error', (err) => rej(err));
        });

        const promessaServidores = new Promise((res, rej) => {
            fs.createReadStream(path.join(__dirname, 'data', 'atis.csv'))
                .pipe(csv())
                .on('data', (row) => servidores.push(row))
                .on('end', () => res())
                .on('error', (err) => rej(err));
        });

        Promise.all([promessaRemuneracoes, promessaServidores])
            .then(() => {
                const mapaRemuneracoes = new Map(remuneracoes.map(r => [r.idServidor, r.remuneracaoBruta]));
                
                const dadosCompletos = servidores
                    .map(servidor => {
                        const remuneracao = mapaRemuneracoes.get(servidor.Id_SERVIDOR_PORTAL);
                        if (remuneracao !== undefined) {
                            return {
                                ...servidor,
                                remuneracaoBruta: remuneracao
                            };
                        }
                        return null;
                    })
                    .filter(s => s !== null && s.ORG_EXERCICIO);

                resolve(dadosCompletos);
            })
            .catch(reject);
    });
}

function agregarDados(dadosCompletos) {
    const orgaos = {};
    const cargos = {};

    dadosCompletos.forEach(servidor => {
        const orgExercicio = servidor.ORG_EXERCICIO;
        const uorgExercicio = servidor.UORG_EXERCICIO;
        const cargoKey = `${servidor.CLASSE_CARGO}-${servidor.PADRAO_CARGO}`;
        const salario = servidor.remuneracaoBruta;

        if (!orgaos[orgExercicio]) {
            orgaos[orgExercicio] = {
                nome: orgExercicio,
                uorgs: {},
                servidores: [],
                totalSalarios: 0,
                maiorSalario: -Infinity,
                menorSalario: Infinity,
                cargos: {}
            };
        }
        
        const org = orgaos[orgExercicio];
        org.servidores.push(servidor);
        org.totalSalarios += salario;
        if (salario > org.maiorSalario) org.maiorSalario = salario;
        if (salario < org.menorSalario) org.menorSalario = salario;
        org.cargos[cargoKey] = (org.cargos[cargoKey] || 0) + 1;

        if (!org.uorgs[uorgExercicio]) {
            org.uorgs[uorgExercicio] = {
                nome: uorgExercicio,
                servidores: [],
                totalSalarios: 0,
                maiorSalario: -Infinity,
                menorSalario: Infinity,
                cargos: {}
            };
        }

        const uorg = org.uorgs[uorgExercicio];
        uorg.servidores.push(servidor);
        uorg.totalSalarios += salario;
        if (salario > uorg.maiorSalario) uorg.maiorSalario = salario;
        if (salario < uorg.menorSalario) uorg.menorSalario = salario;
        uorg.cargos[cargoKey] = (uorg.cargos[cargoKey] || 0) + 1;

        if (!cargos[cargoKey]) {
            cargos[cargoKey] = {
                servidores: [],
                totalSalarios: 0,
                maiorSalario: -Infinity,
                menorSalario: Infinity
            };
        }

        const cargo = cargos[cargoKey];
        cargo.servidores.push(servidor);
        cargo.totalSalarios += salario;
        if (salario > cargo.maiorSalario) cargo.maiorSalario = salario;
        if (salario < cargo.menorSalario) cargo.menorSalario = salario;
    });

    const dadosOrgaos = Object.values(orgaos).map(org => ({
        ...org,
        quantidade: org.servidores.length,
        mediaSalarial: org.totalSalarios / org.servidores.length,
        uorgs: Object.values(org.uorgs).map(uorg => ({
            ...uorg,
            quantidade: uorg.servidores.length,
            mediaSalarial: uorg.totalSalarios / uorg.servidores.length
        })).sort((a,b) => b.quantidade - a.quantidade)
    })).sort((a, b) => b.quantidade - a.quantidade);

    const dadosCargos = Object.entries(cargos).map(([key, cargo]) => ({
        descricao: key,
        ...cargo,
        quantidade: cargo.servidores.length,
        mediaSalarial: cargo.totalSalarios / cargo.servidores.length,
    })).sort((a,b) => a.descricao.localeCompare(b.descricao));

    const dadosDispersao = [];
    let indiceGlobal = 1;
    dadosCargos.forEach(cargo => {
        cargo.servidores.forEach(servidor => {
            dadosDispersao.push({
                x: indiceGlobal++,
                y: servidor.remuneracaoBruta,
                servidor: servidor.NOME,
                cargo: `${servidor.CLASSE_CARGO}-${servidor.PADRAO_CARGO}`
            });
        });
    });


    return { dadosOrgaos, dadosCargos, dadosDispersao };
}


app.get('/', async (req, res) => {
    try {
        const dadosCompletos = await processarDados();
        const { dadosOrgaos, dadosCargos, dadosDispersao } = agregarDados(dadosCompletos);
        res.render('index', { 
            dadosOrgaos, 
            dadosCargos, 
            dadosDispersao, 
            formatarMoeda,
            totalServidores: dadosCompletos.length
        });
    } catch (error) {
        console.error("Erro ao processar os dados:", error);
        res.status(500).send("Erro ao processar os arquivos CSV. Verifique o console do servidor.");
    }
});

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});