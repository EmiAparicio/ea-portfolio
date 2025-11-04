import { setupWorker } from 'msw/browser';
import { allHandlers } from './handlers';

/**
 * Exporta el Service Worker de MSW para el navegador.
 * * @example
 * // En el entrypoint de tu app (cliente):
 * import { worker } from '@ea-portfolio/mock-server';
 * * async function enableMocking() {
 * if (process.env.NODE_ENV === 'development') {
 * await worker.start();
 * }
 * }
 * * enableMocking().then(() => {
 * // Inicia tu app de React
 * });
 */
export const worker = setupWorker(...allHandlers);

/**
 * Re-exporta todos los tipos generados de la API
 * para conveniencia en la importación.
 */
export * from './generated/api.types';
