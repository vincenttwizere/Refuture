import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AppRouter from "./App.jsx";

// Force light theme on page load
const forceLightTheme = () => {
  const root = document.documentElement;
  root.classList.remove('dark', 'theme-dark', 'theme-auto');
  root.classList.add('theme-light');
  localStorage.setItem('theme', 'light');
};

// Run immediately
forceLightTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)