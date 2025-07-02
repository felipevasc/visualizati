import React, { useState } from "react"

type TableProps = {
    data: { [key: string]: React.ReactNode }[]
}

const Table: React.FC<TableProps> = ({ data }) => {
    const [showCollapse, setShowCollapse] = useState<{ [key: string]: boolean }>({})
    return <div className="br-table">
        <table>
            <caption>Título da Tabela</caption>
            <thead>
                {data?.[0] && <tr>{Object.keys(data[0])?.map(k => k !== 'collapse' ? <th>{k}</th> : <th></th>)}</tr>}
            </thead>
            <tbody>
                {data?.map((d, idx) => (
                    <React.Fragment key={idx}>
                        <tr onClick={() => setShowCollapse(obj => ({ ...obj, [idx]: !obj[idx] }))} className="collapse-icon">
                            {Object.keys(d).map(k => k !== 'collapse' ?
                                (<td key={k}>{d[k]}</td>) :
                                <td key={k}>
                                    {
                                        showCollapse[idx] ?
                                            <i className="fas fa-chevron-down"></i> :
                                            <i className="fas fa-chevron-right"></i>
                                    }
                                </td>)}
                        </tr>
                        {d['collapse'] && showCollapse[idx] && (
                            <tr className="collapse">
                                <td colSpan={Object.keys(d).length - 1}>
                                    {d['collapse']}
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    </div>
}

export default Table