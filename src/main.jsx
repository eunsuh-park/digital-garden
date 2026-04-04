import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App.jsx';

console.info(
  `[yangju-garden] environment: ${import.meta.env.MODE} (DEV=${import.meta.env.DEV}, PROD=${import.meta.env.PROD})`
);
import '@/shared/styles/tokens.css';
import '@/shared/styles/typography.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
