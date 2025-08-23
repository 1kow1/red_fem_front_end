import DataFrame from "../components/DataFrame"
import { testData } from '../data/testData';
import { formConfigs } from '../configs/formConfigs';

export default function Usuarios() {

  const filterQuery = (usuario, searchQuery) => {
    const removeAccents = (string) => {
      return string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    
    const nomeMatch = removeAccents(usuario.nome || "").includes(
      removeAccents(searchQuery)
    );
    
    const emailMatch = removeAccents(usuario.email || "").includes(
      removeAccents(searchQuery)
    );
    
    const funcaoMatch = removeAccents(usuario.funcao || "").includes(
      removeAccents(searchQuery)
    );
    
    return nomeMatch || emailMatch || funcaoMatch;
  }

  return <>
    <div>
      <h1 className="text-lg mb-4">Usuários</h1>
      <DataFrame
        title="Usuário"
        filterQuery={filterQuery}
        data={testData.usuarios}
        dataType="usuarios"
        formFields={formConfigs.usuarios}
      />
    </div>
  </>
}