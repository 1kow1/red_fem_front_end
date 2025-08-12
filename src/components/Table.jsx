/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom"

export default function Table({ data, className }) {
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
    window.location.href = `${window.location.href}/${row.id}`
  }

  return (
    <div className={`rounded-sm border-2 ${className}`}>
      <table className="w-full">
        <thead className="">
          {headers.map((header) => (
            (header=='id')?<></>:
            <th key={header} className={`${(typeof data[0][header] == "number") ? "text-center " : "text-left "}
              bg-redfemDarkWhite font-medium px-2 py-1 rounded-sm
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