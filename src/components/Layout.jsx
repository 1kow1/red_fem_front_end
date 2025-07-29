import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function Wrapper({ children }){
  return <>
    <div className='py-5 px-16 w-full'>
      {children}
    </div>
  </>
}

export default function Layout() {
  return <>
    <div className='flex flex-row'>
      <Sidebar/>
      <Wrapper>
        <Outlet/>
      </Wrapper>
    </div>
  </>
}