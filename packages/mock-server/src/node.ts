import { setupServer } from 'msw/node';
import { allHandlers } from './handlers';

/**
 * Exporta el servidor de MSW para entornos Node.js (ej. Vitest).
 * * @example
 * // En tu archivo vitest.setup.ts:
 * import { server } from '@ea-portfolio/mock-server/node';
 * * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 */
export const server = setupServer(...allHandlers);

/**
 * Re-exporta todos los tipos generados de la API
 * para conveniencia en la importación.
 */
export * from './generated/api.types';
