/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom"

const data = [
  {
    id: 'jfkdnr34i9',
    nome: 'Idomar',
    idade: 50,
    cargo: 'Professor'
  },
  {
    id: 'dfsmreu390',
    nome: 'Diolete',
    idade: 50,
    cargo: 'Professor'
  },
  {
    id: 'j49003jja',
    nome: 'Ezequiel',
    idade: 50,
    cargo: 'Professor'
  }
]

export function TableDumb({ data, className }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  const headers = Object.keys(data[0])

  const formatHeader = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return "-"
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No"
    }
    if (typeof value === "object") {
      return JSON.stringify(value)
    }
    return String(value)
  }

  const handleRowClick = (row, index) => {
    window.location.href = `/consultas/${row.id}`
  }

  return (
    <div className={`rounded-md border-2 ${className}`}>
      <table className="w-full">
        <thead className="">
          {headers.map((header) => (
            (header=='id')?<></>:
            <th key={header} className={`${(typeof data[0][header] == "number") ? "text-center " : "text-left "}
              bg-redfemDarkWhite font-medium px-2 py-1 rounded-md
            `}>
              {formatHeader(header)}
            </th>
          ))}
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-redfemHoverPink"
              onClick={() => handleRowClick(row, index)}
              role='button'
            >
              {headers.map((header) => (
                (header=='id')?<></>:
                <td className={
                  `${(typeof row[header] == "number") ? "text-center " : " "}
                  p-2 border-t-2
                  `
                } key={`${index}-${header}`}>
                  {formatCellValue(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TableSmart() {
  // const fetching = true

  return <>
    <TableDumb data={data} />
  </>
}