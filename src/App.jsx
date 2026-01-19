import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AuthLayout from './components/layout/AuthLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLayout><LoginPage/></AuthLayout>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/home" element={<h1>Logged In </h1>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;