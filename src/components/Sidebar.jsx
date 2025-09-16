import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import Logo from "./Logo"
import { NavLink } from "react-router-dom"
import DropdownMenu from "./DropdownMenu"
import ModalEditarPerfil from "./ModalEditarPerfil"
import { CalendarIcon, FormIcon, HelpIcon, PacientIcon, SettingsIcon, UserIcon } from "./Icons"
import { User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/auth/useAuth'
import { toast } from 'react-toastify'
import { canUseComponent } from '../utils/permissions'

function PageLink({ to, text, children }) {

  return <>
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => ((isActive) ? 'bg-redfemHoverPink' : '') +
          " px-2 py-1 flex gap-2 hover:bg-redfemHoverPink rounded-md hover-links"}
      >
        {children}
        <span className="">{text}</span>
      </NavLink>
    </li>
  </>
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isModalPerfilOpen, setIsModalPerfilOpen] = useState(false);

  const handleEditProfile = () => {
    setIsModalPerfilOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const configDropdownOptions = [
    {
      label: 'Editar Perfil',
      icon: User,
      onClick: handleEditProfile
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      variant: 'danger'
    }
  ];

  return (
    <>
      <div className="fixed px-3 py-4 w-60 h-screen max-h-screen border-r-2 border-slate-200
        flex flex-col justify-between">
        <div className="flex flex-col gap-8 w-max">
          <Logo />

          <div>
            <ul className="flex flex-col gap-1">
              {canUseComponent(user?.cargo, 'sidebar', 'consultas') && (
                <PageLink to={'/consultas'} text={'Consultas'}>
                  <CalendarIcon color={'black'} />
                </PageLink>
              )}

              {canUseComponent(user?.cargo, 'sidebar', 'formularios') && (
                <PageLink to={'/formularios'} text={'Formulários'}>
                  <FormIcon color={'black'} />
                </PageLink>
              )}

              {canUseComponent(user?.cargo, 'sidebar', 'pacientes') && (
                <PageLink to={'/pacientes'} text={'Pacientes'}>
                  <PacientIcon color={'black'} />
                </PageLink>
              )}
            </ul>
          </div>
        </div>

        <div>
          <hr className="pb-1" />
          <ul className="flex flex-col gap-1">
            {/* Dropdown de Configurações */}
            <li>
              <DropdownMenu
                trigger={
                  <>
                    <SettingsIcon color={'black'} />
                    <span>Configurações</span>
                  </>
                }
                options={configDropdownOptions}
              />
            </li>

            {canUseComponent(user?.cargo, 'sidebar', 'usuarios') && (
              <PageLink to={'/usuarios'} text={'Usuários'}>
                <UserIcon color={'black'} />
              </PageLink>
            )}
            <PageLink to={'/ajuda'} text={'Ajuda'}>
              <HelpIcon color={'black'} />
            </PageLink>
          </ul>
        </div>
      </div>

      {/* Modal de Editar Perfil */}
      <ModalEditarPerfil
        isOpen={isModalPerfilOpen}
        onClose={() => setIsModalPerfilOpen(false)}
      />
    </>
  );
}