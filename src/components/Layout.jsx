import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import ContextualHelpModal from './ContextualHelpModal'
import useKeyboardShortcut from '../hooks/useKeyboardShortcut'
import { HelpProvider, useHelp } from '../contexts/HelpContext'

function Wrapper({ children }){
  return <>
    <div className='py-5 px-16 w-full ml-60'>
      {children}
    </div>
  </>
}

function LayoutContent() {
  const location = useLocation();
  const { isHelpModalOpen, openHelp, closeHelp } = useHelp();

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
  useKeyboardShortcut('F1', openHelp);

  return <>
    <ContextualHelpModal
      isOpen={isHelpModalOpen}
      onClose={closeHelp}
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

export default function Layout() {
  return (
    <HelpProvider>
      <LayoutContent />
    </HelpProvider>
  );
}