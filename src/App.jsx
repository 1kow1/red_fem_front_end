import { BrowserRouter as Router } from "react-router-dom";
import MyRoutes from './routes/myRoutes'
import { AuthProvider } from "./contexts/auth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <MyRoutes/>
      </Router>
    </AuthProvider>
  );
}

export default App;