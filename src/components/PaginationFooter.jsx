export function PaginationFooter({ page, totalPages, onPageChange, className, totalRecords, size = 10 }) {
  // Calcula as páginas para mostrar
  const getVisiblePages = () => {
    const delta = 2; // Quantas páginas mostrar de cada lado
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (range[0] > 0) {
      if (range[0] > 1) {
        rangeWithDots.push(0, '...');
      } else {
        rangeWithDots.push(0);
      }
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) {
        rangeWithDots.push('...', totalPages - 1);
      } else {
        rangeWithDots.push(totalPages - 1);
      }
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const buttonBaseClass = "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border";
  const buttonActiveClass = "bg-redfemActionPink text-white border-redfemPink shadow-sm";
  const buttonInactiveClass = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400";
  const buttonDisabledClass = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

  if (totalPages <= 1) {
    return (
      <div className={`mt-6 flex items-center justify-between ${className || ""}`}>
        <div className="text-sm text-gray-600">
          {totalRecords && `Total: ${totalRecords.toLocaleString()} registros`}
        </div>
        <div className="text-sm text-gray-500">
          Página 1 de 1
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-6 ${className || ""}`}>
      <div className="flex items-center justify-between">
        {/* Informações dos registros */}
        <div className="text-sm text-gray-600">
          {totalRecords && (
            <>
              Mostrando{" "}
              <span className="font-semibold text-gray-900">
                {(page * size) + 1}
              </span>{" "}
              até{" "}
              <span className="font-semibold text-gray-900">
                {Math.min((page + 1) * size, totalRecords)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-gray-900">
                {totalRecords.toLocaleString()}
              </span>{" "}
              registros
            </>
          )}
        </div>

        {/* Controles de paginação */}
        <div className="flex items-center space-x-2">
          {/* Primeira página */}
          <button
            onClick={() => onPageChange(0)}
            disabled={page === 0}
            className={`${buttonBaseClass} ${
              page === 0 ? buttonDisabledClass : buttonInactiveClass
            }`}
            title="Primeira página"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Anterior */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className={`${buttonBaseClass} ${
              page === 0 ? buttonDisabledClass : buttonInactiveClass
            }`}
            title="Página anterior"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Números das páginas */}
          {visiblePages.map((pageNum, index) => (
            <span key={index}>
              {pageNum === '...' ? (
                <span className="px-3 py-2 text-gray-500 text-sm">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={`${buttonBaseClass} min-w-[40px] ${
                    pageNum === page ? buttonActiveClass : buttonInactiveClass
                  }`}
                >
                  {pageNum + 1}
                </button>
              )}
            </span>
          ))}

          {/* Próxima */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= totalPages}
            className={`${buttonBaseClass} ${
              page + 1 >= totalPages ? buttonDisabledClass : buttonInactiveClass
            }`}
            title="Próxima página"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page + 1 >= totalPages}
            className={`${buttonBaseClass} ${
              page + 1 >= totalPages ? buttonDisabledClass : buttonInactiveClass
            }`}
            title="Última página"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Indicador de página mobile (só aparece em telas pequenas) */}
      <div className="mt-3 flex justify-center sm:hidden">
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {page + 1} de {totalPages}
        </span>
      </div>
    </div>
  );
}