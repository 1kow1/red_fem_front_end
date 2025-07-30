export function ButtonPrimary({children, className}){
  return <>
    <button className={`px-4 py-2 h-fit rounded-lg bg-redfemActionPink text-white
        hover:bg-redfemPink active:bg-redfemDarkPink whitespace-nowrap
        flex gap-2 items-center 
        ${className || ""}`}
    >
      {children}
    </button>
  </>
}

export function ButtonSecondary({children, className}){
  return <>
    <button className={`px-4 py-2 h-fit rounded-lg bg-redfemLighterGray
        hover:bg-redfemLightGray active:bg-redfemGray
        ${className || ""}`}
    >
      {children}
    </button>
  </>
}