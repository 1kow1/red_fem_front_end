import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import ContextualHelpModal from './ContextualHelpModal'
import useKeyboardShortcut from '../hooks/useKeyboardShortcut'

function Wrapper({ children }){
  return <>
    <div className='py-5 px-16 w-full ml-60'>
      {children}
    </div>
  </>
}

export default function Layout() {
  const location = useLocation();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Mapear rotas para contextos de ajuda
  const getHelpContext = () => {
    const path = location.pathname;
    if (path.includes('/consultas')) return 'consultas';
    if (path.includes('/pacientes')) return 'pacientes';
    if (path.includes('/formularios') && path.includes('/editar')) return 'formulario-editor';
    if (path.includes('/formularios')) return 'formularios';
    if (path.includes('/usuarios')) return 'usuarios';
    if (path.includes('/execucao')) return 'execucao-formulario';
    return 'default';
  };

  // Atalho F1 global para todas as páginas
  useKeyboardShortcut('F1', () => {
    setIsHelpModalOpen(true);
  });

  return <>
    <ContextualHelpModal
      isOpen={isHelpModalOpen}
      onClose={() => setIsHelpModalOpen(false)}
      context={getHelpContext()}
    />

    <div className='flex flex-row'>
      <Sidebar/>
      <Wrapper>
        <Outlet/>
      </Wrapper>
    </div>
  </>
}