import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import DashboardPage from './components/DashboardPage'
import ChatPage from './components/ChatPage'

function App() {
  const location = useLocation();
  const showLandingNavbar = location.pathname === '/';

  return (
    <>
      {showLandingNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat/:repoId" element={<ChatPage />} />
      </Routes>
    </>
  )
}

export default App
