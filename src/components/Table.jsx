// components/Table.jsx
import { useState } from "react";
import DetailsPopup from "./DetailsPopup.jsx";
import { popupConfigs } from "../configs/detailsConfigs.js";

export default function Table({
  data,
  className,
  dataType = "generic",
  disablePopup = false,
  onEditRow,        // RECEBE do DataFrame -> prop que vem da página
  onDeleteRow,
  onReactivateRow,
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [popupConfig, setPopupConfig] = useState({});

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  const headers = Object.keys(data[0]).filter(k => !Array.isArray(data[0][k]));

  const formatHeader = (key) => key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")
    .replace(/^./, str => str.toUpperCase()).trim();

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  const handleRowClick = (row) => {
    if (disablePopup) return;

    const configGenerator = popupConfigs[dataType];
    if (!configGenerator) {
      console.error(`Configuração não encontrada para tipo: ${dataType}`);
      return;
    }

    try {
      const config = configGenerator.getConfig(row, {
        onEditUser: () => {
          setIsPopupOpen(false);
          onEditRow?.(row);
        },
        onDeleteUser: (user) => {
          setIsPopupOpen(false);
          onDeleteRow?.(user);
        },
        onReactivateUser: (user) => {
          setIsPopupOpen(false);
          onReactivateRow?.(user);
        }
      });

      setSelectedRowData(row);
      setPopupConfig(config);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Erro ao gerar configuração:", error);
    }
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedRowData(null);
    setPopupConfig({});
  }

  return (
    <>
      <div className={`rounded-sm border-2 ${className}`}>
        <table className="w-full">
          <thead>
            <tr>
              {headers.map(header => header === 'id' ? null : (
                <th key={header} className="bg-gray-100 font-bold text-base px-2 py-1">
                  {formatHeader(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}
                  className={`${!disablePopup ? 'hover:bg-redfemHoverPink cursor-pointer' : ''}`}
                  onClick={() => handleRowClick(row, index)}>
                {headers.map(header => header === 'id' ? null : (
                  <td key={`${index}-${header}`} className="p-2 border-t-2">
                    {formatCellValue(row[header], header)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!disablePopup && (
        <DetailsPopup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          data={selectedRowData}
          config={popupConfig}
        />
      )}
    </>
  )
}
