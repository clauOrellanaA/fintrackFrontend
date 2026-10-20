import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Fingerprint, LockKeyhole, Sparkles, Wallet } from 'lucide-react';
import { ApiError, connectionMessage } from '../../shared/api/http';
import { useSession } from '../../shared/session/SessionProvider';

export function SignInPanel() {
  const { signIn, signUp, notice } = useSession();
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      if (registering) await signUp(email, password, displayName);
      else await signIn(email, password);
    }
    catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      setError(cause instanceof ApiError && cause.kind === 'conflict' ? 'Ese correo ya tiene una cuenta. Inicia sesión o utiliza otro correo.'
        : cause instanceof ApiError && (cause.kind === 'unauthenticated' || cause.kind === 'validation') ? registering ? 'Revisa el nombre, correo y contraseña. Usa al menos 12 caracteres.' : 'No pudimos iniciar sesión. Revisa tu correo y contraseña.'
          : connectionMessage(cause));
    } finally { setBusy(false); }
  }
  return <div className="signin-grid">
    <section className="welcome-card" aria-labelledby="welcome-title">
      <span className="eyebrow"><Sparkles size={15} aria-hidden="true" />MENOS RUIDO, MÁS CLARIDAD</span>
      <div className="welcome-symbol" aria-hidden="true"><Wallet size={38} strokeWidth={1.5} /><span><Check size={18} /></span></div>
      <h2 id="welcome-title">Tu dinero.<br />Todo en su lugar.</h2><p>Un espacio tranquilo para entender tu mes y dar el siguiente paso.</p>
      <ul className="welcome-benefits"><li><Check size={16} aria-hidden="true" />Una mirada clara a tus finanzas</li><li><Check size={16} aria-hidden="true" />Tus objetivos, siempre presentes</li><li><Check size={16} aria-hidden="true" />Información privada, decisiones tuyas</li></ul>
      <span className="welcome-caption">A TU RITMO. TODOS LOS DÍAS.</span>
    </section>
    <section className="signin-card" aria-labelledby="signin-title">
      <span className="signin-icon" aria-hidden="true"><Fingerprint size={29} strokeWidth={1.5} /></span><h2 id="signin-title">{registering ? 'Crea tu cuenta' : 'Tu panel te espera'}</h2><p className="muted">{registering ? 'Empieza a organizar tus finanzas con un espacio privado.' : 'Ingresa para conectar con tu información.'}</p>
      {notice === 'expired' && <p className="notice notice--warning" role="alert">Tu sesión terminó. Vuelve a ingresar para continuar.</p>}
      {notice === 'logout-unconfirmed' && <p className="notice notice--warning" role="alert">Tu acceso se cerró en este dispositivo. No pudimos confirmar el cierre en el servidor.</p>}
      {notice === 'password-changed' && <p className="notice notice--warning" role="status">Contraseña actualizada. Inicia sesión con tu nueva contraseña.</p>}
      <form onSubmit={event => void submit(event)}>
        {registering && <><label htmlFor="display-name">Nombre visible</label><input id="display-name" name="displayName" type="text" autoComplete="name" required maxLength={80} value={displayName} onChange={event => setDisplayName(event.target.value)} disabled={busy} /></>}
        <label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={254} placeholder="tu@correo.com" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
        <label htmlFor="password">Contraseña</label><div className="password-field"><input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 12 : 1} maxLength={1024} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /><button className="password-toggle" type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div>
        {error && <p className="notice notice--danger" role="alert">{error}</p>}
        <button className="button button--primary signin-submit" type="submit" disabled={busy}>{busy ? 'Conectando…' : registering ? 'Crear mi cuenta' : 'Entrar a mi panel'}<ArrowRight size={18} aria-hidden="true" /></button>
      </form><button className="auth-mode-toggle" type="button" onClick={() => { setRegistering(value => !value); setError(null); }} disabled={busy}>{registering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</button><p className="signin-footnote"><LockKeyhole size={14} aria-hidden="true" />Tu acceso no se guarda en el navegador.</p>
    </section>
  </div>;
}
