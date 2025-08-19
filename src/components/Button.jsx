export function ButtonPrimary({children, className, ...props}){
  return <>
    <button
    {...props} 
    className={`px-4 py-2 h-fit rounded-md bg-redfemActionPink text-white
        hover:bg-redfemPink active:bg-redfemDarkPink whitespace-nowrap
        flex gap-2 items-center 
        ${className || ""}`}
    >
      {children}
    </button>
  </>
}

export function ButtonSecondary({children, className,...props}){
  return <>
    <button 
    {...props} 
    className={`px-4 py-2 h-fit rounded-md bg-gray-200 hover:bg-gray-300
        ${className || ""}`}
    >
      {children}
    </button>
  </>
}