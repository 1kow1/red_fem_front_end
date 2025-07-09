import { Route, Routes } from 'react-router';
import Login from '../pages/login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default AppRoutes;