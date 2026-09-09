import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MiniPlayerApp } from './components/MiniPlayerApp';
import './index.css';

const params = new URLSearchParams(window.location.search);
const isMiniPlayer = params.get('miniplayer') === '1';
if (isMiniPlayer) {
  document.body.classList.add('miniplayer-mode');
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    {isMiniPlayer ? <MiniPlayerApp /> : <App />}
  </React.StrictMode>,
);
