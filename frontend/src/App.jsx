import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ModuleListPage from './pages/ModuleListPage'
import CreateReview from './components/CreateReview'
import GetReview from './components/GetReview'
import EditReview from './components/EditReview'
import DashboardPage from './pages/DashboardPage'
import NavBar from './components/NavBar'
import BackToTop from './components/BackToTop'
import Toolbar from '@mui/material/Toolbar';

import EmailReminder from './components/EmailReminder'

import "@fontsource/roboto";

function App() {

  return (
    <BrowserRouter>
      {/* The Header component is placed here so it appears on every page */}
      <NavBar/>

      {/* ADD THE INVISIBLE ANCHOR RIGHT AFTER THE HEADER */}
      <Toolbar id="back-to-top-anchor" />

      {/* Define the routes for your application */}
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/module-list" element={<ModuleListPage />} />
          <Route path="/create-review" element={<CreateReview />} />
          <Route path="/create-review/:moduleCode?" element={<CreateReview />} />

          <Route path="/get-review" element={<GetReview />} />
          <Route path='/edit-review/:reviewId' element={<EditReview />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/send-reminder" element={<EmailReminder />} />
        </Routes>
      </main>

      {/* ADD THE BUTTON COMPONENT AT THE END */}
      <BackToTop />

    </BrowserRouter>
  )
}

export default App
