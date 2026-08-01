import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './paginas/Login.jsx'
import { temToken } from './servicos/api.js'

function RotaProtegida({ children }) {
  return temToken() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        import Teste from './paginas/Teste.jsx'
// ...
<Route path="/teste" element={<RotaProtegida><Teste /></RotaProtegida>} />
        path="/projetos"
        element={
          <RotaProtegida>
            <div>
              <h1>Projetos</h1>
              <p>Em construção...</p>
            </div>
          </RotaProtegida>
        }
      />
      <Route path="*" element={<Navigate to={temToken() ? '/projetos' : '/login'} replace />} />
    </Routes>
  )
}
