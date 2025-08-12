import Table from "../components/table"
import Searchbar from "../components/Searchbar"
import { ButtonPrimary } from "../components/Button"
import { AddIcon } from "../components/Icons"
import { useState, useEffect } from "react"

import { data } from "./usuarios"

export default function DataFrame({filterQuery, addLabel=""}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState(data)

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

  return <>
    <div>
      <div className="flex flex-row gap-2">
        <Searchbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fetchData={fetchData}
        />
        <ButtonPrimary>
          <AddIcon />
          {addLabel}
        </ButtonPrimary>
      </div>
      <Table data={results} />
    </div>
  </>
}