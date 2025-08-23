import DataFrame from "../components/DataFrame"
import { testData } from '../data/testData';

export default function Formularios() {

  const filterQuery = (formulario, searchQuery) => {
    const removeAccents = (string) => {
      return string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    
    const nomeMath = removeAccents(formulario.nome || "").includes(
      removeAccents(searchQuery)
    );

    const descricaoMatch = removeAccents(formulario.descricao || "").includes(
      removeAccents(searchQuery)
    );

    const especialidadeMatch = removeAccents(formulario.especialidade || "").includes(
      removeAccents(searchQuery)
    );

    return nomeMath || descricaoMatch || especialidadeMatch;
  }

  return <>
    <div>
      <h1 className="text-lg mb-4">Formulários</h1>
      <DataFrame
        title="Formulário"
        filterQuery={filterQuery}
        data={testData.formularios}
        dataType="formularios"
      />
    </div>
  </>
}

