import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ModuleListPage from './pages/ModuleListPage'
import CreateReview from './components/CreateReview'
import GetReview from './components/GetReview'
import DashboardPage from './pages/DashboardPage'
import NavBar from './components/NavBar'

import "@fontsource/roboto";

function App() {

  return (
    <BrowserRouter>
      {/* The Header component is placed here so it appears on every page */}
      <NavBar/>
      {/* Define the routes for your application */}
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/module-list" element={<ModuleListPage />} />
          <Route path="/create-review" element={<CreateReview />} />
          <Route path="/create-review/:moduleCode?" element={<CreateReview />} />
          <Route path="/get-review/:module.reviewId" element={<GetReview />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
