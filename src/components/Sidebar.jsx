import Logo from "./Logo"
import { Link } from "react-router-dom"
import { NavLink } from "react-router-dom"
import { CalendarIcon, FormIcon, HelpIcon, PacientIcon, SettingsIcon, UserIcon } from "./Icons"

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
  return <>
    <div className="fixed px-3 py-4 w-60 h-screen max-h-screen border-r-2 border-slate-200
      flex flex-col justify-between">
      <div className="flex flex-col gap-8 w-max">
        <Logo />

        <div>
          <ul className="flex flex-col gap-1">
            <PageLink to={'/consultas'} text={'Consultas'}>
              <CalendarIcon color={'black'} />
            </PageLink>
            <PageLink to={'/formularios'} text={'Formulários'}>
              <FormIcon color={'black'} />
            </PageLink>
            <PageLink to={'/pacientes'} text={'Pacientes'}>
              <PacientIcon color={'black'} />
            </PageLink>
          </ul>
        </div>
      </div>

      <div>
        <hr className="pb-1" />
        <ul className="flex flex-col gap-1">
          <PageLink to={'/configuracoes'} text={'Configurações'}>
            <SettingsIcon color={'black'} />
          </PageLink>
          <PageLink to={'/usuarios'} text={'Usuários'}>
            <UserIcon color={'black'} />
          </PageLink>
          <PageLink to={'/ajuda'} text={'Ajuda'}>
            <HelpIcon color={'black'} />
          </PageLink>
        </ul>
      </div>
    </div>
  </>
}