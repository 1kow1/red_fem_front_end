import { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { generateCSVReport, generatePDFReport } from '../utils/reportUtils';
import { toast } from 'react-toastify';

export default function ModalRelatorio({ isOpen, onClose, pacienteData, consultas = [] }) {
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');

  if (!isOpen || !pacienteData) return null;

  const handleGenerateReport = async () => {
    try {
      setLoading(true);


      if (selectedFormat === 'csv') {
        await generateCSVReport(pacienteData, consultas);
        toast.success('Relatório CSV gerado com sucesso!');
      } else if (selectedFormat === 'pdf') {
        await generatePDFReport(pacienteData, consultas);
        toast.success('Relatório PDF gerado com sucesso!');
      }

      onClose();
    } catch (error) {
      toast.error('Erro ao gerar relatório: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const consultasComExecucao = consultas.filter(c => c.execucaoFormulario);
  const totalRespostas = consultas.reduce((total, consulta) => {
    return total + (consulta.execucaoFormulario?.respostas?.length || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Gerar Relatório
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Dados do paciente */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Paciente:</h3>
            <p className="text-lg font-semibold text-gray-900">{pacienteData.nome}</p>
            <p className="text-sm text-gray-600">CPF: {pacienteData.cpf || 'N/A'}</p>
          </div>

          {/* Estatísticas */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Dados a serem incluídos:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• {consultas.length} consulta(s) registrada(s)</p>
              <p>• {consultasComExecucao.length} execução(ões) de formulário</p>
              <p>• {totalRespostas} resposta(s) de formulários</p>
            </div>
          </div>

          {/* Seleção de formato */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Formato do relatório:</h4>

            <div className="space-y-3">
              {/* CSV Option */}
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="mr-3"
                  disabled={loading}
                />
                <FileText size={20} className="mr-3 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">CSV (Excel)</div>
                  <div className="text-sm text-gray-500">Planilha para análise de dados</div>
                </div>
              </label>

              {/* PDF Option */}
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={selectedFormat === 'pdf'}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="mr-3"
                  disabled={loading}
                />
                <FileText size={20} className="mr-3 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">PDF</div>
                  <div className="text-sm text-gray-500">Relatório formatado para impressão</div>
                </div>
              </label>
            </div>
          </div>

          {/* Warning for empty data */}
          {consultas.length === 0 && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Este paciente não possui consultas registradas.
                O relatório conterá apenas dados pessoais.
              </p>
            </div>
          )}

          {consultasComExecucao.length === 0 && consultas.length > 0 && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ As consultas registradas não possuem formulários associados.
                O relatório incluirá dados das consultas sem respostas de formulários.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-redfemActionPink hover:bg-redfemDarkPink text-white rounded-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Gerando...
              </>
            ) : (
              <>
                <Download size={16} />
                Gerar Relatório
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}