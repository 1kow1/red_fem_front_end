export default function Input({ type, placeholder, className, autoSize = false, ...props }) {
  // Define larguras específicas baseadas no tipo de campo
  const getAutoSizeClass = () => {
    if (!autoSize) return 'w-full';

    switch (type) {
      case 'email':
        return 'w-80'; // Largura para emails (~20-30 chars)
      case 'tel':
        return 'w-40'; // Largura para telefones (~11 dígitos)
      case 'date':
        return 'w-36'; // Largura para datas (DD/MM/YYYY)
      case 'time':
        return 'w-24'; // Largura para horários (HH:MM)
      case 'number':
        return 'w-24'; // Largura para números pequenos
      default:
        // Para campos de texto, usar largura baseada no placeholder
        if (placeholder) {
          const length = placeholder.length;
          if (length <= 15) return 'w-40';
          if (length <= 25) return 'w-60';
          if (length <= 35) return 'w-80';
        }
        return 'w-full';
    }
  };

  const widthClass = getAutoSizeClass();

  return (
    <input
      type={type}
      className={`
        border-b border-b-gray-950 placeholder:text-gray-500
        p-1 mb-4 outline-none
        focus:border-b-redfemActionPink focus:border-b-2 focus:bg-redfemOffWhite
        disabled:bg-gray-50
        ${widthClass}
        ${className}`}
      placeholder={placeholder}
      {...props}
    />
  );
}