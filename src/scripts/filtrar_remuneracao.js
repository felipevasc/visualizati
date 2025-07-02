const fs = require('fs');
const path = require('path');

const start = async () => {

    const ATI_CSV  = path.join(__dirname, '../resources/atis.csv');
    const textAti = fs.readFileSync(ATI_CSV, 'utf8');
    const linesAti = textAti.split(/\r?\n/).filter(l => l.trim() !== '');
    const dataLinesAti = linesAti.slice(1)
    const ids = dataLinesAti.map(line => {
        const cols = line.split(',');
        return cols[0];
    });

    
    
    const INPUT_CSV  = path.join(__dirname, '../resources/202505_Remuneracao.csv');
    const OUTPUT_CSV = path.join(__dirname, '../resources/202505_Remuneracao_pub.csv');
    const OUTPUT_JSON = path.join(__dirname, '../resources/202505_Remuneracao_pub.json');
    const SERVIDORES_JSON = path.join(__dirname, '../resources/servidores.json');
    
    function parseLine(line) {
      const out = [];
      let cur = '', inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i+1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ';' && !inQuotes) {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out;
    }
    
    function toCSV(rows) {
      return rows
        .map(cols =>
          cols
            .map(f => `"${f.replace(/"/g, '""')}"`)
            .join(';')
        )
        .join('\n');
    }
    
    const text = fs.readFileSync(INPUT_CSV, 'utf8');
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    const header = parseLine(lines[0]);
    const dataLines = lines.slice(1).map(parseLine);
    const idIdx = header.findIndex(h => h === 'Id_SERVIDOR_PORTAL');
    if (idIdx === -1) {
      console.error('Cabeçalho não contém "Id_SERVIDOR_PORTAL"');
      process.exit(1);
    }
    
    const filtered = dataLines.filter(cols => {
      const idCsv = cols[idIdx];
      return ids.some(idSrv => {
        return idSrv === idCsv;
      });
    });
    
    const outRows = [header, ...filtered];
    fs.writeFileSync(OUTPUT_CSV, toCSV(outRows), 'utf8');
    const cabecalho = outRows[0];
    const json = []
    for (let i = 1; i < outRows.length; i++) {
      const row = outRows[i];
      const obj = {};
      for (let j = 0; j < cabecalho.length; j++) {
        const key = cabecalho[j];
        obj[key] = row[j];
      }
      json.push(obj);
    }
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(json), 'utf8');

    console.log(`✅ ${filtered.length} linhas gravadas em ${OUTPUT_CSV}`);
}

start()