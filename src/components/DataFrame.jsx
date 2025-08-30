import Table from "../components/Table"
import Searchbar from "../components/Searchbar"
import { ButtonPrimary } from "../components/Button"
import { AddIcon } from "../components/Icons"
import { useState } from "react"
import FormPopUp from "../components/FormPopUp";

export default function DataFrame({ 
  title = "", 
  data,           // recebe os dados como prop
  dataType,       // tipo de dados para o popup
  formFields,     // campos do formulário
  handleCreate,   // função de criação
  searchQuery,
  setSearchQuery,
  fetchData       // função que chama a API
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div>
        <div className="flex flex-row gap-2">
          <Searchbar
            placeholder={`${title.toLowerCase()}...`}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            fetchData={fetchData}
          />
          <ButtonPrimary onClick={() => setIsModalOpen(true)}>
            <AddIcon />
            Adicionar {title}
          </ButtonPrimary>
        </div>
        
        <Table 
          data={data} 
          dataType={dataType}
          className="mt-4"
        />
      </div>

      {formFields && (
        <FormPopUp  
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Formulário ${title}`}
          fields={formFields}
          onSubmit={handleCreate}
        />
      )}
    </>
  )
}
