import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from '@shared/app/components/ToastProvider';
import { UserProvider } from '@shared/app/context/UserContext';
import { AuthProvider } from '@shared/auth/AuthProvider';
import '@shared/designSystem/styles.css';

const baseUrl = import.meta.env.BASE_URL;
const routerBasename = baseUrl === '/' ? undefined : baseUrl.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <UserProvider>
          <ToastProvider><App /></ToastProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
