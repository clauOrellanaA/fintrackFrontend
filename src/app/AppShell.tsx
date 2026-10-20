import { useEffect, useRef } from 'react';
import { ChartNoAxesCombined, CircleHelp, Flag, LayoutDashboard, LogOut, Menu, PiggyBank, ShieldCheck, Wallet, ArrowLeftRight, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../shared/session/SessionProvider';

function Brand() {
  return <Link className="brand" to="/dashboard" aria-label="FinanTrack, panel principal">
    <span className="brand-mark" aria-hidden="true"><span>f</span><i /></span>
    <span>Finan<span className="brand-light">Track</span><small>FINANZAS A TU RITMO</small></span>
  </Link>;
}
function Navigation({ signedIn }: { signedIn: boolean }) {
  return <nav aria-label="Navegación principal" className="main-nav">
    <span className="nav-label">TU ESPACIO</span>
    <NavLink to="/dashboard" className="nav-item"><LayoutDashboard size={18} aria-hidden="true" />Panel principal</NavLink>
    <NavLink to="/transactions" className="nav-item"><ArrowLeftRight size={18} aria-hidden="true" />Movimientos</NavLink>
    <NavLink to="/budgets" className="nav-item"><Wallet size={18} aria-hidden="true" />Presupuestos</NavLink>
    <NavLink to="/reports" className="nav-item"><ChartNoAxesCombined size={18} aria-hidden="true" />Análisis</NavLink>
    {[{ name: 'Metas de ahorro', icon: Flag }].map(({ name, icon: Icon }) =>
    {signedIn && <NavLink to="/account" className="nav-item"><UserRound size={18} aria-hidden="true" />Mi cuenta</NavLink>}
    {[{ name: 'Metas de ahorro', icon: Flag }, { name: 'Análisis', icon: ChartNoAxesCombined }].map(({ name, icon: Icon }) =>
      <span className="nav-item nav-item--upcoming" key={name} aria-disabled="true" title="Disponible próximamente"><Icon size={18} aria-hidden="true" />{name}<small>Pronto</small></span>)}
  </nav>;
}
export function AppShell() {
  const { session, signOut } = useSession();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousToken = useRef(session?.token);
  useEffect(() => {
    if (previousToken.current !== session?.token) {
      previousToken.current = session?.token;
      mainRef.current?.focus();
    }
  }, [session?.token]);
  const pageTitle = location.pathname.startsWith('/transactions') ? 'Movimientos' : location.pathname.startsWith('/budgets') ? 'Presupuestos' : location.pathname.startsWith('/reports') ? 'Análisis' : 'Panel principal';
  const pageTitle = location.pathname.startsWith('/transactions') ? 'Movimientos' : location.pathname.startsWith('/budgets') ? 'Presupuestos' : location.pathname.startsWith('/account') ? 'Mi cuenta' : 'Panel principal';
  return <div className="app-frame">
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <aside className="sidebar"><Brand /><Navigation signedIn={Boolean(session)} />
      <div className="sidebar-bottom"><div className="sidebar-note"><PiggyBank size={26} aria-hidden="true" /><strong>Un paso a la vez.</strong><p>Las pequeñas decisiones también cuentan.</p></div><span className="sidebar-caption"><CircleHelp size={16} aria-hidden="true" />Hecho para tu día a día</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="desktop-breadcrumb">Tu espacio<span>/</span><strong>{pageTitle}</strong></div>
        <div className="mobile-brand"><Brand /></div>
        <div className="topbar-actions">
          {session ? <><span className="account" title={session.email}><span className="avatar" aria-hidden="true">{session.email[0].toUpperCase()}</span><span className="account-email">{session.email}</span></span><button className="icon-button" type="button" onClick={() => void signOut()} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={19} aria-hidden="true" /></button></>
            : <span className="secure-label"><ShieldCheck size={17} aria-hidden="true" />Acceso seguro</span>}
          <details className="mobile-menu"><summary aria-label="Abrir navegación"><Menu size={21} aria-hidden="true" /></summary><div className="mobile-menu-content"><Navigation signedIn={Boolean(session)} /></div></details>
        </div>
      </header>
      <main ref={mainRef} id="main-content" className="workspace-content" tabIndex={-1}><Outlet /></main>
      <footer className="workspace-footer"><span>FinanTrack</span><span><ShieldCheck size={14} aria-hidden="true" />Tus finanzas, tu espacio.</span></footer>
    </div>
  </div>;
}
