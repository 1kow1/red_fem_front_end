import { SearchIcon, FilterIcon } from "./Icons"
import { ButtonSecondary } from "./Button"

export default function Searchbar({placeholder, searchQuery, setSearchQuery, fetchData}) {
  return <>
    <div className="flex gap-2 mb-4 items-center w-full">
      <div className="relative flex-1">
        <div className="absolute left-4 bottom-3.5">
          <SearchIcon  />
        </div>
        <input
          type="text"
          placeholder={`Pesquise em ${placeholder}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-5 py-2 w-full border-2 rounded-lg outline-redfemPink"
        />
        <button
          className="absolute right-4 bottom-3 hover:text-redfemPink active:text-redfemDarkPink"
          // variant={isFilterOpen ? "default" : "outline"}
          // onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FilterIcon />
          {/* {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )} */}
        </button>
      </div>
      
      <ButtonSecondary onClick={fetchData}>
        Procurar
      </ButtonSecondary>
    </div>
  </>
}