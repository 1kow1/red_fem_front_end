import { BrowserRouter as Router } from "react-router-dom";
import MyRoutes from './routes/myRoutes'
import { AuthProvider } from "./contexts/auth";

function App() {
  return (
    <AuthProvider>
      <Router basename="/red_fem_front_end">
        <MyRoutes/>
      </Router>
    </AuthProvider>
  );
}

export default App;