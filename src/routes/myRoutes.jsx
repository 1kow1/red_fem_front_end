import { Route, Routes } from 'react-router';
import Login from '../pages/login';
import Layout from "../components/Layout";
import Consultas from '../pages/Consultas';
import Usuarios from '../pages/Usuarios';

function AppRoutes() {
  return (
    <Routes>
      <Route path='/login' element={<Login/>} />
      
      <Route path='/' element={<Layout/>}>
        <Route path='/consultas' element={<Consultas/>}/>
        <Route path='/formularios' element={<Consultas/>}/>
        <Route path='/pacientes' element={<Consultas/>}/>
        <Route path='/usuarios' element={<Usuarios/>}/>
      </Route>
    
    </Routes>
  )
}

export default AppRoutes;