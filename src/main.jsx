import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import MainPage from './components/about-us/page.jsx'
import ContactPage from './components/contact/ContactPage.jsx'
import ProjectsPage from './components/projects/ProjectsPage.jsx'
import './styles/main.scss'

// --- Console Signature for Awwwards Judges ---
if (typeof window !== 'undefined') {
  console.log(
    '%c TOM KING %c PORTFOLIO %c',
    'background: #111; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 3px 0 0 3px;',
    'background: #f33; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 0 3px 3px 0;',
    'background: transparent'
  );
  console.log(
    '%cHi Jury! %cCheck out the code quality. Clean console = happy dev. 🚀',
    'font-weight: bold; color: #f33; font-size: 14px;',
    'color: #666; font-size: 14px;'
  );
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<MainPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
