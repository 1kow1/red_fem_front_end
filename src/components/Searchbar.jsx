import { SearchIcon, FilterIcon } from "./Icons"
import { ButtonSecondary } from "./Button"

export default function Searchbar({placeholder, searchQuery, setSearchQuery, onClickFilter, fetchData}) {

  return <>
    <div className="flex gap-2 items-center w-full">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <SearchIcon  />
        </div>
        <input
          type="text"
          placeholder={`Pesquise em ${placeholder}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-12 py-2 w-full border-2 rounded-lg outline-redfemPink"
        />
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-redfemPink active:text-redfemDarkPink transition-colors"
          onClick={onClickFilter}
          aria-label="Filtros"
          title="Abrir filtros"
        >
          <FilterIcon />
        </button>
      </div>
    </div>
  </>
}