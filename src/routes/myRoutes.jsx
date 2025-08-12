import { Route, Routes } from 'react-router';
import Login from '../pages/login';
import Layout from "../components/Layout";
import Consultas from '../pages/Consultas';
import Pacientes from '../pages/Pacientes';
import Formularios from '../pages/Formularios';

function AppRoutes() {
  return (
    <Routes>
      <Route path='/login' element={<Login/>} />
      
      <Route path='/' element={<Layout/>}>
        <Route path='/consultas' element={<Consultas/>}/>
        <Route path='/formularios' element={<Formularios/>}/>
        <Route path='/pacientes' element={<Pacientes/>}/>
      </Route>
    
    </Routes>
  )
}

export default AppRoutes;