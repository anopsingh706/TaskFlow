import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#111118',
          border: '1px solid #E8E7F0',
          borderRadius: '14px',
          fontSize: '14px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: '500',
          boxShadow: '0 4px 24px rgba(91,79,233,0.12), 0 0 0 1px rgba(91,79,233,0.06)',
          padding: '12px 16px',
        },
        success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
)
