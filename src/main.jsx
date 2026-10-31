import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// StrictMode is intentionally not used: its double-invoked effects in development
// would send duplicate API requests (and duplicate one-time POSTs like verify-email).
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
