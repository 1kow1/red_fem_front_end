import React from 'react';

export function ButtonPrimary({children, className, ...props}){
  return <>
    <button
    {...props} 
    className={`px-4 py-2 h-fit rounded-md bg-redfemActionPink text-white
        hover:bg-redfemPink active:bg-redfemDarkPink whitespace-nowrap
        flex gap-2 items-center 
        disabled:bg-redfemLightGray
        ${className || ""}`}
    >
      {children}
    </button>
  </>
}

export function ButtonPrimaryDropdown({children, className, variant = "primary", options = [], ...props}){
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const baseClasses = "px-4 py-2 h-fit rounded-md whitespace-nowrap flex gap-2 items-center disabled:bg-redfemLightGray relative";

  const variantClasses = variant === "secondary"
    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300"
    : "bg-redfemActionPink text-white hover:bg-redfemPink active:bg-redfemDarkPink";

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        {...props}
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseClasses} ${variantClasses} ${className || ""}`}
      >
        {children}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && options.length > 0 && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.onClick?.();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function IconButton({children, className, ...props}){
  return <>
    <button
    {...props} 
    className={`${className || ""}`}
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
      disabled:bg-redfemLightGray disabled:text-white
      ${className || ""}`}
    >
      {children}
    </button>
  </>
}