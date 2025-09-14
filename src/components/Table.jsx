/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import DetailsPopup from "./DetailsPopup.jsx";
import { popupConfigs } from "../config/detailsConfig.js";

export default function Table({
  data,
  className,
  dataType = "generic",
  disablePopup = false,
  statusConfig = null, // Nova prop para configuração de status
  onEditRow,
  onToggleRow,
  onAssociarFormulario,
  callbacks: externalCallbacks
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [popupConfig, setPopupConfig] = useState({});

  // callbacks que passaremos ao getConfig (useMemo evita recriação desnecessária)
  const callbacks = useMemo(() => {
    const allCallbacks = {
      onEdit: onEditRow,
      onToggle: onToggleRow,
      onAssociarFormulario: onAssociarFormulario,
      // Incluir callbacks externas se fornecidas
      ...(externalCallbacks || {})
    };

    console.log("🔧 Callbacks finais no Table:", allCallbacks);
    return allCallbacks;
  }, [onEditRow, onToggleRow, onAssociarFormulario, externalCallbacks]);

  useEffect(() => {
    if (!selectedRowData) return;

    const updated = data.find(d => d.id === selectedRowData.id);
    if (updated) {
      setSelectedRowData(updated);

      try {
        const configGenerator = popupConfigs[dataType];
        console.log(callbacks)
        console.log(configGenerator)
        if (configGenerator) {
          const newConfig = configGenerator.getConfig(updated, callbacks);
          setPopupConfig(newConfig);
        }
      } catch (err) {
        console.error("Erro ao regenerar popupConfig:", err);
      }
    } else {
      handleClosePopup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  const headers = Object.keys(data[0])
  .filter((key) => !Array.isArray(data[0][key]))
  .filter((key) => !key.startsWith('_')); // OCULTAR CAMPOS COM _

  const formatHeader = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const formatCellValue = (value, key = null) => {
    if (value === null || value === undefined) {
      return "-"
    }

    // Formatação especial para status se configuração fornecida
    if (key === 'status' && statusConfig && statusConfig[value]) {
      return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[value].className || 'bg-gray-100 text-gray-800'}`}>
          <div className={`w-2 h-2 rounded-full ${statusConfig[value].dotColor || 'bg-gray-500'}`}></div>
          {value}
        </span>
      );
    }

    if (typeof value === "object") {
      return JSON.stringify(value)
    }
    return String(value)
  }

  const handleRowClick = (row, index) => {
    if (disablePopup) return;

    const configGenerator = popupConfigs[dataType];
    console.log("Table: handleRowClick", row);
    if (!configGenerator) {
      console.error(`Configuração não encontrada para tipo: ${dataType}`);
      console.log("Tipos disponíveis:", Object.keys(popupConfigs));
      return;
    }

    try {
      console.log(callbacks)
      const config = configGenerator.getConfig(row, callbacks);
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
          <thead className="">
            {headers.map((header) => (
              (header==='id')?null:
              <th key={header} className={`${(typeof data[0][header] === "number") ? "text-center " : "text-left "} bg-gray-100 font-bold text-base px-2 py-1`}>
                {formatHeader(header)}
              </th>
            ))}
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`${!disablePopup ? 'hover:bg-redfemHoverPink cursor-pointer' : ''}`}
                onClick={() => handleRowClick(row, index)}
                role={!disablePopup ? 'button' : undefined}
              >
                {headers.map((header) => (
                  (header==='id')?null:
                  <td className={`${(typeof row[header] === "number") ? "text-center " : " "} p-2 border-t-2`} key={`${index}-${header}`}>
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
          onAssociarFormulario={onAssociarFormulario}
          callbacks={callbacks}
        />
      )}
    </>
  )
}
