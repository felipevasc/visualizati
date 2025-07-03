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

const tabelaATI = {
  'A-I': 11150.8,
  'A-II': 11524.47,
  'A-III': 11913.07,
  'A-IV': 12316.08,
  'A-V': 12736.08,
  'B-I': 13274.44,
  'B-II': 13713.69,
  'B-III': 14207.17,
  'B-IV': 14701.32,
  'B-V': 15215.15,
  'B-VI': 15749.17,
  'C-I': 16433.76,
  'C-II': 17016.02,
  'C-III': 17621.16,
  'C-IV': 17955.92,
  'C-V': 18298.02,
  'C-VI': 18647.02,
};

const tabelaFCE = {
  'FCE 1 17': 13630.81,
  'FCE 1 16': 12004.84,
  'FCE 1 15': 10424.34,
  'FCE 1 14': 8916.56,
  'FCE 1 13': 7937.44,
  'FCE 1 12': 5976.02,
  'FCE 1 11': 4765.13,
  'FCE 1 10': 4087.96,
  'FCE 1 09': 3209.6,
  'FCE 1 08': 3078.91,
  'FCE 1 07': 2668.47,
  'FCE 1 06': 2259.64,
  'FCE 1 05': 1925.77,
  'FCE 1 04': 1425.44,
  'FCE 1 03': 1187.56,
  'FCE 1 02': 664.2,
  'FCE 1 01': 393.01,
};

function processarDados() {
  return new Promise((resolve, reject) => {
    const remuneracoes = [];
    const servidores = [];

    const promessaRemuneracoes = new Promise((res, rej) => {
      fs.createReadStream(
        path.join(__dirname, 'data', '202505_Remuneracao_pub.csv'),
        { encoding: 'UTF-8' }
      )
        .pipe(
          csv({ separator: ';', mapHeaders: ({ header }) => header.trim() })
        )
        .on('data', (row) => {
          const remuneracaoBruta = parseFloat(
            row[Object.keys(row)[5]]?.replace(',', '.') || 0
          );
          if (row['Id_SERVIDOR_PORTAL'] && !isNaN(remuneracaoBruta)) {
            remuneracoes.push({
              idServidor: row['Id_SERVIDOR_PORTAL'],
              remuneracaoBruta: remuneracaoBruta,
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
        const mapaRemuneracoes = new Map(
          remuneracoes.map((r) => [r.idServidor, r.remuneracaoBruta])
        );

        const dadosCompletos = servidores
          .map((servidor) => {
            const remuneracao = mapaRemuneracoes.get(
              servidor.Id_SERVIDOR_PORTAL
            );
            if (remuneracao !== undefined) {
              return {
                ...servidor,
                remuneracaoBruta: remuneracao,
              };
            }
            return null;
          })
          .filter((s) => s !== null && s.ORG_EXERCICIO);

        resolve(dadosCompletos);
      })
      .catch(reject);
  });
}

function agregarDados(dadosCompletos) {
  const orgaos = {};
  const cargos = {};

  dadosCompletos.forEach((servidor) => {
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
        cargos: {},
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
        cargos: {},
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
        menorSalario: Infinity,
      };
    }

    const cargo = cargos[cargoKey];
    cargo.servidores.push(servidor);
    cargo.totalSalarios += salario;
    if (salario > cargo.maiorSalario) cargo.maiorSalario = salario;
    if (salario < cargo.menorSalario) cargo.menorSalario = salario;
  });

  const dadosOrgaos = Object.values(orgaos)
    .map((org) => ({
      ...org,
      quantidade: org.servidores.length,
      mediaSalarial: org.totalSalarios / org.servidores.length,
      uorgs: Object.values(org.uorgs)
        .map((uorg) => ({
          ...uorg,
          quantidade: uorg.servidores.length,
          mediaSalarial: uorg.totalSalarios / uorg.servidores.length,
        }))
        .sort((a, b) => b.quantidade - a.quantidade),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const dadosCargos = Object.entries(cargos)
    .map(([key, cargo]) => ({
      descricao: key,
      ...cargo,
      quantidade: cargo.servidores.length,
      mediaSalarial: cargo.totalSalarios / cargo.servidores.length,
    }))
    .sort((a, b) => a.descricao.localeCompare(b.descricao));

  const dadosDispersao = [];
  let indiceGlobal = 1;
  dadosCargos.forEach((cargo) => {
    cargo.servidores.forEach((servidor) => {
      dadosDispersao.push({
        x: indiceGlobal++,
        y: servidor.remuneracaoBruta,
        servidor: servidor.NOME,
        cargo: `${servidor.CLASSE_CARGO}-${servidor.PADRAO_CARGO}`,
      });
    });
  });

  return { dadosOrgaos, dadosCargos, dadosDispersao };
}

app.get('/', async (req, res) => {
  try {
    const dadosCompletos = await processarDados();
    const { dadosOrgaos, dadosCargos, dadosDispersao } =
      agregarDados(dadosCompletos);
    res.render('index', {
      dadosOrgaos,
      dadosCargos,
      dadosDispersao,
      formatarMoeda,
      totalServidores: dadosCompletos.length,
      tabelaATI,
      tabelaFCE
    });
  } catch (error) {
    console.error('Erro ao processar os dados:', error);
    res
      .status(500)
      .send(
        'Erro ao processar os arquivos CSV. Verifique o console do servidor.'
      );
  }
});

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
