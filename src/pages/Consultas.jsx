import TableSmart from "../components/table"
import Searchbar from "../components/Searchbar"
import { ButtonPrimary } from "../components/Button"
import { AddIcon } from "../components/Icons"

export default function Consultas() {
  return <>
    <div>
      <h1 className="text-lg mb-4">Consultas</h1>
      <div>
        <div className="flex flex-row gap-2">
          <Searchbar />
          <ButtonPrimary>
            <AddIcon />
            Nova Consulta
          </ButtonPrimary>
        </div>
        <TableSmart />
      </div>
    </div>
  </>
}

