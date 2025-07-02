import { useEffect, useState } from "react"
import { URL_CONSULTA_UNIDADE, URL_ESTRUTURA_ORGANIZACIONAL_RESUMIDA, URL_SERVIDORES_ATI } from "../../utils/constants";
import { Unidade } from "../../types/Unidade";
import { mapUnidade } from "../../utils/maps";
import { ORGAOS_SISP } from "../../utils/ORGAOS_SISP";
import Table from "../../components/Table";
import { Servidor } from "../../types/Servidor";

//https://api.siorg.economia.gov.br/
//https://portaldatransparencia.gov.br/download-de-dados/servidores
//https://portaldatransparencia.gov.br/servidores/consulta/resultado?paginacaoSimples=true&tamanhoPagina=20&offset=0&direcaoOrdenacao=asc&colunaOrdenacao=nome&cargo=ANALISTA+EM+TECNOL+DA+INFORMACAO&colunasSelecionadas=detalhar%2Ctipo%2Ccpf%2Cnome%2CorgaoServidorLotacao%2Cmatricula%2Csituacao%2Cfuncao%2Ccargo%2Cquantidade&t=KmyUhhcHB12s9jx0mtMy&_=1751334998241
const Estrutura = () => {
    const [unidades, setUnidades] = useState<Unidade[]>();
    const [servidores, setServidores] = useState<Servidor[]>();

    useEffect(() => {
        const consultarServidores = async () => {
            const req = await fetch(URL_SERVIDORES_ATI());
            const r = await req.json();
            setServidores(r.data)
        }
        consultarServidores();
    }, [])

    const cargosUnidade = async (codUnid: number, level: number): Promise<any[]> => {
        if (level > 4) {
            return []
        }
        const cargos: any[] = [];
        const req = await fetch(URL_CONSULTA_UNIDADE(codUnid));
        const r = await req.json();
        if (r.unidade?.cargos) {
            cargos.push(r.unidade.cargos);
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
                    const cargosUnidTmp = await cargosUnidade(Number(subunidades[i].codigoUnidade), level + 1)
                    cargos.push(cargosUnidTmp)
                }
            }
        }
        return cargos
    }

    useEffect(() => {
        const consultar = async () => {

            const req = await fetch(URL_ESTRUTURA_ORGANIZACIONAL_RESUMIDA(26))
            const r = await req.json();
            const unidadesTmp = mapUnidade(r?.unidades?.filter((u: Unidade) => ORGAOS_SISP.map(o => o.sigla).includes(u.sigla)));
            

            const unidadesComCollapse = unidadesTmp?.map(u => {
                return {collapse: '' as React.ReactNode, ...u }
            });
            for (let i = 0; i < unidadesComCollapse?.length; i++) {
                if (!unidadesComCollapse?.[i]?.codigoUnidade) {
                    continue
                }
                const codUnid = Number(unidadesComCollapse[i].codigoUnidade);
                
                const cargos = await cargosUnidade(codUnid, 0)

                if (cargos) {
                    unidadesComCollapse[i].collapse = <div style={{ maxWidth: '60%', backgroundColor: '#aafa' }}><Table data={cargos.map((c: any) => ({ cargo: c.denominacao, funcao: c.funcao, qtd: c.instancias?.length ?? 0 }))} /></div> 
                }
            }

            setUnidades(unidadesComCollapse);
        }
        consultar()
    }, [])

    return <>
        <Table data={unidades ?? []} />
    </>
}

export default Estrutura