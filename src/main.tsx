import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App, AppErrorBoundary } from './app/App';
import { AuthProvider } from './features/account/AuthContext';
import { CartProvider } from './features/cart/CartContext';
import { ToastProvider } from './shared/ui';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import './styles.css';
import './responsive.css';

createRoot(document.getElementById('root')!).render(<StrictMode><AppErrorBoundary><BrowserRouter><AuthProvider><CartProvider><ToastProvider><App /></ToastProvider></CartProvider></AuthProvider></BrowserRouter></AppErrorBoundary></StrictMode>);
