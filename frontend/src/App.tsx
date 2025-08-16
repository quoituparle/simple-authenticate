import { Routes, Route } from 'react-router-dom'
import Login from './login'
import Home from './home'
import Registration from './register'
import Verification from './verify-email'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path='/verify-email' element={<Verification />} />
      </Routes>
    </div>
  )
}

export default App