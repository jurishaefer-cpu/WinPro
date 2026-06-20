import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

window.onerror = (msg, src, line, col, err) => {
  document.getElementById('root').innerHTML =
    `<div style="padding:40px;font-family:monospace;color:red;font-size:14px">
      <b>FEHLER:</b><br>${msg}<br><br>${err?.stack ?? ''}</div>`;
};

window.onunhandledrejection = (e) => {
  document.getElementById('root').innerHTML =
    `<div style="padding:40px;font-family:monospace;color:red;font-size:14px">
      <b>PROMISE FEHLER:</b><br>${e.reason}</div>`;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
