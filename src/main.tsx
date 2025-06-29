import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import LandingPage from './LandingPage.tsx'
import './index.css'

// Simple routing logic
const urlParams = new URLSearchParams(window.location.search)
const showLanding = urlParams.get('page') !== 'dashboard'

const RootComponent = showLanding ? LandingPage : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
) 