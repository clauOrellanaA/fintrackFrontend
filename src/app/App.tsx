import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../shared/session/SessionProvider';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TransactionsPage } from '../features/transactions/TransactionsPage';
import { AppShell } from './AppShell';
import './styles/shell.css';

export function App() {
  return <BrowserRouter><SessionProvider><Routes><Route element={<AppShell />}>
    <Route index element={<Navigate to="/dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="transactions" element={<TransactionsPage />} />
    <Route path="*" element={<section className="not-found"><h1>Este camino no lleva a tu panel</h1><p>Vuelve a tu espacio para continuar.</p><Link to="/dashboard">Ir al panel principal</Link></section>} />
  </Route></Routes></SessionProvider></BrowserRouter>;
}
