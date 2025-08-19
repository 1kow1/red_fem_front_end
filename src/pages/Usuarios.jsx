import DataFrame from "../components/DataFrame"

export default function Usuarios() {
  const filterQuery = (paciente, searchQuery) => {
    const removeAccents = (string) => {
      return string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    return removeAccents(paciente.nome).includes(
      removeAccents(searchQuery)
    )
  }

  return (
    <>
      <div>
        <h1 className="text-lg mb-4">Usuários</h1>
        <DataFrame
          title="Usuário"
          filterQuery={filterQuery}
        />
      </div>
    </>
  );
}
