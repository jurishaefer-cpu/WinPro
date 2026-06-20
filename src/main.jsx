import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext'
import { ViewProvider } from './view/ViewContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ViewProvider>
          <App />
        </ViewProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
