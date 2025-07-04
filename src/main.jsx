import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BiensManager from './components/BiensManager.jsx' 
import PropertyBookingApp from './components/PropertyBookingApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <BiensManager /> */}
    <App />
  </StrictMode>,
)
