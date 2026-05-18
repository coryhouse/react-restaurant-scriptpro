import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Menu from './Menu.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Menu />
  </StrictMode>,
)
