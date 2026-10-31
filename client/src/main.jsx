import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c1917',
            color: '#e7e5e4',
            border: '1px solid #292524',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#5d8a1e', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
