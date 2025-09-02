// components/DataFrame.jsx
import Table from "./Table"
import Searchbar from "./Searchbar"
import { ButtonPrimary } from "./Button"
import { AddIcon } from "./Icons"

export default function DataFrame({
  title = "",
  data,
  dataType,
  formFields,
  // callbacks controlados pela página
  onAddRow,     // chamado quando clicar em "Adicionar"
  onEditRow,    // repassado ao Table/Details
  onDeleteRow,
  onReactivateRow,
  searchQuery,
  setSearchQuery,
  fetchData
}) {
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
          <ButtonPrimary onClick={() => onAddRow?.()}>
            <AddIcon />
            Adicionar {title}
          </ButtonPrimary>
        </div>
        
        <Table 
          data={data}
          dataType={dataType}
          className="mt-4"
          onEditRow={onEditRow}
          onDeleteRow={onDeleteRow}
          onReactivateRow={onReactivateRow}
          formFields={formFields}
        />
      </div>
    </>
  )
}
