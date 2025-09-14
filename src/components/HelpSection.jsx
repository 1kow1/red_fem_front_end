import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function HelpSection({ title, children, defaultOpen = false, id }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4" id={id}>
      <button
        onClick={toggleSection}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {isOpen ? (
          <ChevronDown size={20} className="text-gray-600" />
        ) : (
          <ChevronRight size={20} className="text-gray-600" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4 prose max-w-none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}