import DataFrame from "../components/DataFrame"
import { testData } from '../data/testData';
import { formConfigs } from '../configs/formConfigs';

export default function Pacientes() {

  const filterQuery = (paciente, searchQuery) => {
    const removeAccents = (string) => {
      return string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    
    // Busca no nome, CPF ou email
    const nomeMatch = removeAccents(paciente.nome || "").includes(
      removeAccents(searchQuery)
    );
    
    const cpfMatch = (paciente.cpf || "").includes(searchQuery);
    
    const emailMatch = removeAccents(paciente.email || "").includes(
      removeAccents(searchQuery)
    );
    
    return nomeMatch || cpfMatch || emailMatch;
  }

  return <>
    <div>
      <h1 className="text-lg mb-4">Pacientes</h1>
      <DataFrame
        title="Paciente"
        filterQuery={filterQuery}
        data={testData.pacientes}
        dataType="pacientes"
        formFields={formConfigs.pacientes}
      />
    </div>
  </>
}

