import { Unidade } from "../types/Unidade";

export const mapUnidade = (unidades: Unidade[]) => {
    return unidades?.map(u => ({sigla: u.sigla, nome: u?.nome, codigoUnidade: u?.codigoUnidade?.split("/")?.pop() ?? '', codigoTipoUnidade: u?.codigoTipoUnidade?.split("/")?.pop() ?? ''}))
}