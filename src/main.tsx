import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

import { ThemeProvider } from './components/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vayna-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
