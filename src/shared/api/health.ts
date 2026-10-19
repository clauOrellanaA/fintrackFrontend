export async function checkApi(signal?: AbortSignal): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) throw new Error('Configura VITE_API_BASE_URL en .env.');
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, { signal });
  if (!response.ok) throw new Error('La API no está disponible.');
  const result: unknown = await response.json();
  if (typeof result !== 'object' || result === null || !('status' in result) || result.status !== 'ok') {
    throw new Error('La API devolvió una respuesta inesperada.');
  }
}
