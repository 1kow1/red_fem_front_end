import Table from "../components/Table"
import Searchbar from "../components/Searchbar"
import { ButtonPrimary } from "../components/Button"
import { AddIcon } from "../components/Icons"
import { useState, useEffect } from "react"
import FormPopUp from "../components/FormPopUp";

export default function DataFrame({ 
  title = "", 
  filterQuery, 
  data,           // recebe os dados como prop
  dataType,       // tipo de dados para o popup
  formFields,      // campos do formulário
  handleCreate     // qual metodo será utilizado post/put
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchData = () => {
    if (!data) {
      setResults([]);
      return;
    }
    
    if (!searchQuery.trim()) {
      setResults(data);
      return;
    }
    
    const filteredData = data.filter(item => filterQuery(item, searchQuery));
    setResults(filteredData);
  }

  useEffect(() => {
    if (data && data.length > 0) {
      setResults(data);
    }
  }, [data])

  useEffect(() => {
    fetchData();
  }, [searchQuery, data])

  return <>
    <div>
      <div className="flex flex-row gap-2">
        <Searchbar
          placeholder={`Buscar ${title.toLowerCase()}...`}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fetchData={fetchData}
        />
        <ButtonPrimary onClick={() => {setIsModalOpen(true);}}>
          <AddIcon />
          Adicionar {title}
        </ButtonPrimary>
      </div>
      
      {/* Passando dataType para o Table */}
      <Table 
        data={results} 
        dataType={dataType}
        className="mt-4"
      />
    </div>

    {/* Formulário só renderiza se tiver campos definidos */}
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
}