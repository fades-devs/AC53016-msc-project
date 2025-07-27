import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import ModuleListPage from './pages/ModuleListPage'
import CreateReview from './components/CreateReview'
import GetReview from './components/GetReview'
import EditReview from './components/EditReview'
import DashboardPage from './pages/DashboardPage'
import NavBar from './components/NavBar'
import BackToTop from './components/BackToTop'
import Toolbar from '@mui/material/Toolbar';

import EmailReminder from './components/EmailReminder'

import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';


function App() {

  return (

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* The Header component so it appears on every page */}
          <NavBar/>
          {/* THE INVISIBLE ANCHOR RIGHT AFTER THE HEADER */}
          <Toolbar id="back-to-top-anchor" />
          {/* Main content area with consistent padding */}
          <Box component="main"
            sx={{
              flexGrow: 1,
              py: 4, // Vertical padding
              px: { xs: 2, sm: 3, md: 4 }, // Responsive horizontal padding
              maxWidth: '1400px', // Set a max width for large screens
              mx: 'auto', // Center the content
              width: '100%',
            }}>
              <Routes>
                <Route path="/module-list" element={<ModuleListPage />} />
                <Route path="/create-review" element={<CreateReview />} />
                <Route path="/create-review/:moduleCode?" element={<CreateReview />} />
                <Route path="/get-review" element={<GetReview />} />
                <Route path='/edit-review/:reviewId' element={<EditReview />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/send-reminder" element={<EmailReminder />} />
              </Routes>
          </Box>
        </Box>
        <BackToTop />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
