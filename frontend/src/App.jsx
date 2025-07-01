import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ModuleListPage from './pages/ModuleListPage'
import CreateReview from './components/CreateReview'
import GetReview from './components/GetReview'
import DashboardPage from './pages/DashboardPage'

import "@fontsource/roboto";

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/module-list" element={<ModuleListPage />} />
        <Route path="/create-review" element={<CreateReview />} />
        <Route path="/get-review" element={<GetReview />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
