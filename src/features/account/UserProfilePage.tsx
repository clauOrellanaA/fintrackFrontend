import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../shared/api/http';
import { useSession } from '../../shared/session/SessionProvider';
import { changePassword, getProfile, updateProfile, type UserProfile } from '../../shared/session/api';
import { SignInPanel } from '../auth/SignInPanel';
import './account.css';

function errorMessage(error: unknown, context: 'load-profile' | 'save-profile' | 'password'): string {
  if (error instanceof ApiError && error.kind === 'conflict') {
    return 'Ese correo ya está en uso o la fecha inicial no es compatible con tu historial.';
  }
  if (error instanceof ApiError && error.kind === 'validation') return 'Revisa los datos ingresados e inténtalo de nuevo.';
  if (error instanceof ApiError && error.kind === 'unauthenticated' && context === 'password') {
    return 'La contraseña actual no coincide o la sesión venció. Revisa tus datos e inténtalo de nuevo.';
  }
  if (context === 'load-profile') return 'No pudimos cargar tu perfil. Vuelve a intentarlo.';
  return context === 'save-profile' ? 'No pudimos guardar los cambios. Vuelve a intentarlo.' : 'No pudimos actualizar la contraseña. Vuelve a intentarlo.';
}

export function UserProfilePage() {
  const { session, expire, updateEmail, passwordChanged } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    setLoading(true);
    setProfile(null);
    setProfileError(null);
    getProfile(session.token, controller.signal)
      .then(setProfile)
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (error instanceof ApiError && error.kind === 'unauthenticated') expire(session.token);
        else setProfileError(errorMessage(error, 'load-profile'));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [session?.token, expire]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !profile) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const result = await updateProfile(session.token, {
        email: profile.email,
        displayName: profile.displayName?.trim() ?? '',
        openingBalance: profile.openingBalance,
        openingDate: profile.openingDate,
      });
      setProfile(result);
      updateEmail(result.email);
      setProfileSaved(true);
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'unauthenticated') expire(session.token);
      else setProfileError(errorMessage(error, 'save-profile'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setSavingPassword(true);
    setPasswordError(null);
    try {
      await changePassword(session.token, currentPassword, newPassword);
      navigate('/dashboard', { replace: true });
      passwordChanged();
    } catch (error) {
      setPasswordError(errorMessage(error, 'password'));
    } finally {
      setSavingPassword(false);
    }
  }

  if (!session) return <div className="account-page"><div className="page-heading"><div><p className="eyebrow">TU CUENTA</p><h1>Tu perfil.</h1></div></div><SignInPanel /></div>;

  return <div className="account-page">
    <div className="page-heading"><div><p className="eyebrow">TU CUENTA</p><h1>Perfil y seguridad.</h1><p className="page-subtitle">Mantén tus datos al día y protege el acceso a tu espacio.</p></div></div>
    {loading && <p className="account-state" role="status">Cargando tu perfil…</p>}
    {profileError && <p className="notice notice--danger" role="alert">{profileError}</p>}
    {profile && <>
      <section className="account-panel" aria-labelledby="profile-heading">
        <div className="account-panel__heading"><div><p className="eyebrow">INFORMACIÓN PERSONAL</p><h2 id="profile-heading">Tu perfil</h2></div></div>
        <form className="account-form" onSubmit={event => void saveProfile(event)}>
          <div className="account-form__grid">
            <div><label htmlFor="profile-name">Nombre visible</label><input id="profile-name" autoComplete="name" required maxLength={80} value={profile.displayName ?? ''} onChange={event => { setProfile({ ...profile, displayName: event.target.value }); setProfileSaved(false); }} disabled={savingProfile} /></div>
            <div><label htmlFor="profile-email">Correo electrónico</label><input id="profile-email" type="email" autoComplete="email" required maxLength={254} value={profile.email} onChange={event => { setProfile({ ...profile, email: event.target.value }); setProfileSaved(false); }} disabled={savingProfile} /></div>
            <div><label htmlFor="opening-balance">Saldo inicial (BOB)</label><input id="opening-balance" inputMode="decimal" required value={profile.openingBalance} onChange={event => { setProfile({ ...profile, openingBalance: event.target.value }); setProfileSaved(false); }} disabled={savingProfile} /></div>
            <div><label htmlFor="opening-date">Fecha del saldo inicial</label><input id="opening-date" type="date" required value={profile.openingDate} onChange={event => { setProfile({ ...profile, openingDate: event.target.value }); setProfileSaved(false); }} disabled={savingProfile} /></div>
          </div>
          <p className="account-help">La moneda de tu cuenta es BOB y no se puede cambiar. Actualizar el saldo inicial modifica el cálculo de tus saldos históricos; no altera tus movimientos.</p>
          {profileError && <p className="notice notice--danger" role="alert">{profileError}</p>}
          {profileSaved && <p className="notice notice--success" role="status">Tu perfil se actualizó correctamente.</p>}
          <button className="button button--primary" type="submit" disabled={savingProfile}>{savingProfile ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>
      </section>
      <section className="account-panel" aria-labelledby="password-heading">
        <div className="account-panel__heading"><div><p className="eyebrow">ACCESO</p><h2 id="password-heading">Cambiar contraseña</h2><p className="account-help">Usa al menos 12 caracteres. Al cambiarla, se cerrarán todas tus sesiones.</p></div></div>
        <form className="account-form" onSubmit={event => void savePassword(event)}>
          <div className="account-form__grid">
            <div><label htmlFor="current-password">Contraseña actual</label><input id="current-password" type="password" autoComplete="current-password" required maxLength={1024} value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} disabled={savingPassword} /></div>
            <div><label htmlFor="new-password">Nueva contraseña</label><input id="new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} value={newPassword} onChange={event => setNewPassword(event.target.value)} disabled={savingPassword} /></div>
            <div><label htmlFor="confirm-password">Confirma la nueva contraseña</label><input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={savingPassword} /></div>
          </div>
          {newPassword && confirmation && newPassword !== confirmation && <p className="notice notice--danger" role="alert">Las contraseñas nuevas no coinciden.</p>}
          {passwordError && <p className="notice notice--danger" role="alert">{passwordError}</p>}
          <button className="button button--primary" type="submit" disabled={savingPassword || !newPassword || newPassword !== confirmation}>{savingPassword ? 'Actualizando…' : 'Actualizar contraseña'}</button>
        </form>
      </section>
    </>}
  </div>;
}
