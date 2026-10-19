import { useEffect, useState } from 'react';
import { checkApi } from '../shared/api/health';

export function App() {
  const [status, setStatus] = useState('Comprobando conexión con la API…');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let active = true;
    checkApi(controller.signal)
      .then(() => { if (active) setStatus('API conectada.'); })
      .catch(() => { if (active) setStatus('No se pudo conectar con la API. Comprueba que el backend esté iniciado.'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  return (
    <main className="startup">
      <h1>FinanTrack</h1>
      <p>La aplicación está lista para comenzar el desarrollo.</p>
      <p role="status">{status}</p>
      <button type="button" onClick={() => {
        setStatus('Comprobando conexión con la API…');
        setAttempt((value) => value + 1);
      }}>Comprobar conexión</button>
      <p>El panel financiero todavía está pendiente de implementación.</p>
    </main>
  );
}
