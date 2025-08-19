import Table from "../components/table"
import Searchbar from "../components/Searchbar"
import { ButtonPrimary } from "../components/Button"
import { AddIcon } from "../components/Icons"
import { useState, useEffect } from "react"
import FormPopUp from "../components/FormPopUp";
import { data } from "./usuarios"

export default function DataFrame({title = "", filterQuery}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState(data)
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // TODO: Não sei ainda onde guardar os tipos de campos de cada página pro formulario
  const camposFormularioUsuario = [
    {
      name: "nome",
      label: "Nome",
      type: "text",
      placeholder: "Insira o Nome",
    },
    {
      name: "email",
      label: "E-mail",
      type: "email",
      placeholder: "email@email.com",
    },
    {
      name: "telefone",
      label: "Telefone",
      type: "tel",
      placeholder: "(42) 9 9999-9999",
    },
    {
      name: "cargo",
      label: "Cargo",
      type: "select",
      placeholder: "Insira o cargo",
      options: [
        { value: "admin", label: "Administrador" },
        { value: "medico", label: "Médico" },
        { value: "secretaria", label: "Secretaria" },
      ],
    },
    {
      name: "senha",
      label: "Senha",
      type: "password",
      placeholder: "************",
    },
    {
      name: "confirmarSenha",
      label: "Confirmar Senha",
      type: "password",
      placeholder: "************",
    },
  ];
  
  const fetchData = () => {
    // fetch("https://backend")
    //   .then((response) => response.json)
    //   .then((json) => {
    //     const res = json.filter((item) => {
    //       console.log(res)
    //     })
    //   })
    
    setResults(data.filter(d => filterQuery(d, searchQuery)))
  }

  useEffect(() => {
    setResults(data)
  }, [])

  const handleCreateUser = (data) => {
    console.log("Criar:", data);
  };

  return <>
    <div>
      <div className="flex flex-row gap-2">
        <Searchbar
          placeholder={title}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fetchData={fetchData}
        />
        <ButtonPrimary onClick={() => {setIsModalOpen(true);}}>
          <AddIcon />
          Adicionar {title}
        </ButtonPrimary>
      </div>
      <Table data={results} />
    </div>

    <FormPopUp  
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Formulário ${title}`}
        fields={camposFormularioUsuario}
        onSubmit={handleCreateUser}
      />
  </>
}