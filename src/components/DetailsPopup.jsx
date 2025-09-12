import { X, Trash2, Edit, Plus } from "lucide-react";
import Table from "./Table";

export default function DetailsPopup({ isOpen, onClose, data, config = {} }) {
  if (!isOpen || !data) return null;

  const {
    title = data.nome || data.paciente || Object.values(data)[0] || "Detalhes",
    fields = [],
    actions = [],
    subTable = null,
    onEdit,
    onDelete,
    onAddNew,
  } = config;

  // Default actions if none provided
  const defaultActions = [
    {
      label: "Desativar",
      icon: Trash2,
      onClick: onDelete,
      variant: "secondary",
    },
    {
      label: "Editar",
      icon: Edit,
      onClick: onEdit,
      variant: "primary",
    },
  ];

  const finalActions = actions.length > 0 ? actions : defaultActions;

  const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const parseBRDate = (raw) => {
    // aceita "dd/mm/yyyy" ou "dd/mm/yyyy hh:mm" (ou com :ss)
    if (!raw) return null;
    if (raw instanceof Date) return raw;
    try {
      const [datePart, timePart] = String(raw).split(" ");
      const [dd, mm, yyyy] = datePart.split("/");
      if (!dd || !mm || !yyyy) return null;
      const [hh = "0", min = "0", ss = "0"] = (
        timePart ? timePart.split(":") : []
      )
        .concat(["0", "0"])
        .slice(0, 3);
      return new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        Number(hh),
        Number(min),
        Number(ss)
      );
    } catch {
      return null;
    }
  };

  const formatValue = (value, type = "text", field = {}) => {
    if (value === null || value === undefined || value === "") return "-";

    // Se já for objeto { label, value, name, nome }
    if (typeof value === "object") {
      return value.label ?? value.nome ?? value.name ?? JSON.stringify(value);
    }

    if (type === "date") {
      const date = parseBRDate(value) ?? new Date(value);
      return date && !isNaN(date.getTime())
        ? date.toLocaleDateString("pt-BR")
        : String(value);
    }

    if (type === "select" || type === "dropdown") {
      // se opções vieram no field -> lookup por value OU label (case-insensitive)
      if (field.options && Array.isArray(field.options)) {
        const valStr = String(value).toLowerCase();
        const opt = field.options.find((o) => {
          if (o == null) return false;
          const v = (o.value ?? o.id ?? "").toString().toLowerCase();
          const lbl = (o.label ?? o.nome ?? "").toString().toLowerCase();
          return v === valStr || lbl === valStr;
        });
        if (opt) return opt.label ?? opt.nome ?? String(opt.value ?? opt);
      }

      // fallback simples
      return String(value);
    }

    if (typeof value === "boolean") return value ? "Sim" : "Não";

    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

          <div className="flex items-center gap-3">
            {/* Action Buttons */}
            {finalActions.length > 0 &&
              finalActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick?.(data)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    action.variant === "primary"
                      ? "bg-pink-500 hover:bg-pink-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {action.icon && <action.icon size={16} />}
                  {action.label}
                </button>
              ))}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Dynamic Fields */}
          {fields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {fields.map((field, index) => {
                const key = field.key ?? field.name; // aceita ambos
                const rawValue = field.path
                  ? getNestedValue(data, field.path)
                  : data?.[key];
                return (
                  <div key={index}>
                    <span className="text-gray-600 font-medium">
                      {field.label}
                    </span>
                    <p className="text-gray-900 mt-1">
                      {formatValue(rawValue, field.type, field)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub Table usando o componente Table reutilizado */}
          {subTable && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {subTable.title}
                </h3>
                {subTable.addButton && (
                  <button
                    onClick={() => onAddNew?.(data)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    {subTable.addButton.label}
                  </button>
                )}
              </div>

              {/* Reutilizando o componente Table */}
              {subTable.data && subTable.data.length > 0 ? (
                <Table
                  data={subTable.data}
                  className="bg-white shadow-sm"
                  dataType={subTable.dataType || "generic"}
                  disablePopup={subTable.disablePopup || false}
                  statusConfig={subTable.statusConfig || null}
                />
              ) : (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
