import DataFrame from "../components/DataFrame"
import { testData } from '../data/testData';
import { formConfigs } from '../configs/formConfigs';

export default function Consultas() {

  const filterQuery = (consulta, searchQuery) => {
    const removeAccents = (string) => {
      return string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    
    // Busca no nome do paciente E no médico solicitante
    const pacienteMatch = removeAccents(consulta.pacienteNome || "").includes(
      removeAccents(searchQuery)
    );
    
    const medicoMatch = removeAccents(consulta.medicoSolicitante || "").includes(
      removeAccents(searchQuery)
    );
    
    return pacienteMatch || medicoMatch;
  }

  return <>
    <div>
      <h1 className="text-lg mb-4">Consultas</h1>
      <DataFrame
        title="Consulta"
        filterQuery={filterQuery}
        data={testData.consultas}
        dataType="consultas"
        formFields={formConfigs.consultas}
      />
    </div>
  </>
}