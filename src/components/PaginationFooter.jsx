export function PaginationFooter({ page, totalPages, onPageChange, className }) {
  return (
    <div className={`mt-6 flex items-center justify-end gap-4 ${className || ""}`}>
      
      {/* Anterior */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className={`px-4 py-2 rounded-md text-sm transition
          ${page === 0 
            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"}`}
      >
        Anterior
      </button>

      {/* Numeração da Página */}
      <span className="text-sm text-gray-700">
        Página <span className="font-semibold">{page + 1}</span> de{" "}
        <span className="font-semibold">{totalPages}</span>
      </span>

      {/* Proximo */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages}
        className={`px-4 py-2 rounded-md border text-sm transition
          ${page + 1 >= totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"}`}
      >
        Próxima
      </button>
    </div>
  );
}
