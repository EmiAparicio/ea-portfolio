# 📄 Documentación: @ea-portfolio/mock-server

### 1. Propósito

Este paquete es el servidor de API mock centralizado para todo el monorepo `ea-portfolio`. No contiene una API monolítica, sino que actúa como un **orquestador de "micro-mocks" modulares**.

Cada demo que requiera simular un backend (REST, GraphQL, o WebSockets) debe proveer su propio módulo de mock dentro de este paquete.

### 2. Arquitectura del Paquete

La arquitectura se divide en dos partes principales:

1.  **El Motor (`src/index.ts`, `src/node.ts`):**
    - Es el núcleo genérico de MSW (`setupWorker` y `setupServer`).
    - La aplicación (`packages/portfolio`) importa _únicamente_ desde estos archivos. No sabe nada sobre las demos individuales.

2.  **Los Módulos de Demo (`src/demos/`):**
    - Cada subcarpeta en `src/demos/` representa un módulo de mock autocontenido (ej. `ecommerce`, `geosocial`).
    - Cada módulo es responsable de definir sus propios _endpoints_ (OpenAPI), _handlers_ (lógica de MSW) y _base de datos_ (faker).

3.  **El Orquestador (`src/handlers.ts`):**
    - Este archivo importa los _handlers_ de todos los módulos de demo y los exporta como un único array (`allHandlers`). El "Motor" consume este array.

4.  **Generación de Tipos (Automatizada):**
    - Un script (`scripts/merge-apis.mjs`) busca todos los archivos `*.openapi.yaml` dentro de `src/demos/`, los **fusiona** en un único `openapi.yaml` en la raíz del paquete, y `openapi-typescript-codegen` genera los tipos (`src/generated/api.types.ts`) a partir de ese archivo fusionado.

### 3. Cómo Añadir Mocks para una Nueva Demo

Este es el flujo de trabajo estándar para añadir mocks para una nueva demo (ej. "mi-nueva-demo").

#### Paso 1: Crear la Carpeta del Módulo

Crea una nueva carpeta dentro de `src/demos/` con el nombre de tu demo.

    # Ejemplo:
    mkdir packages/mock-server/src/demos/mi-nueva-demo

#### Paso 2: Crear los Archivos del Módulo

Dentro de la nueva carpeta, crea los siguientes archivos:

1.  `mi-nueva-demo.openapi.yaml`: (Para APIs REST) La especificación de API de la demo.
2.  `mi-nueva-demo.handlers.ts`: La lógica (MSW) para interceptar las peticiones.
3.  `mi-nueva-demo.db.ts`: (Opcional) Para guardar datos en memoria (ej. con `@faker-js/faker`).

#### Paso 3: Registrar los Handlers

Abre el archivo orquestador: `packages/mock-server/src/handlers.ts`.

Importa tu nuevo array de _handlers_ y añádelo al array `allHandlers`.

    // packages/mock-server/src/handlers.ts

    import type { HttpHandler } from 'msw';
    import { ecommerceHandlers } from './demos/ecommerce/ecommerce.handlers';
    // ... otros handlers
    import { miNuevaDemoHandlers } from './demos/mi-nueva-demo/mi-nueva-demo.handlers'; // <-- 1. IMPORTAR

    /**
     * Array con todos los handlers de MSW combinados.
     */
    export const allHandlers: HttpHandler[] = [
      ...ecommerceHandlers,
      // ... otros handlers
      ...miNuevaDemoHandlers, // <-- 2. AÑADIR
    ];

#### Paso 4: Generar los Nuevos Tipos

Finalmente, ejecuta el script de generación desde la **raíz del monorepo** para actualizar los tipos de TypeScript y que tus nuevos _endpoints_ estén disponibles.

    pnpm --filter @ea-portfolio/mock-server generate:api-types

---

### 4. Descripción de Archivos del Módulo

#### `[demo-name].openapi.yaml`

Define todos los _endpoints_ REST, _request bodies_ y _schemas_ (modelos de datos) para esta demo.

- **Formato:** `OpenAPI 3.0.0`.
- **Importante:** Asegúrate de que `paths` y `components.schemas` estén bien definidos. El script de fusión los combinará todos.
- **Prefijo:** Todos los _paths_ deben comenzar con `/api` (ej. `/api/products`, `/api/geo/points`).

  # src/demos/mi-nueva-demo/mi-nueva-demo.openapi.yaml

  openapi: 3.0.0
  info:
  title: Demo "Mi Nueva Demo"
  version: 1.0.0

  tags: - name: MiDemoTag
  description: Endpoints para mi nueva demo

  paths:
  /api/mi-ruta:
  get:
  tags: [MiDemoTag]
  summary: Obtiene mis datos
  operationId: getMisDatos
  responses:
  '200':
  description: Éxito
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/MiDato'

  components:
  schemas:
  MiDato:
  type: object
  properties:
  id:
  type: string
  value:
  type: number

#### `[demo-name].handlers.ts`

Aquí se implementa la lógica de MSW.

- Debe exportar un array constante llamado `[demo-name]Handlers` (ej. `miNuevaDemoHandlers`).
- Importa `http`, `HttpResponse`, `graphql`, `ws` desde `msw`.
- Importa los tipos generados desde `../../generated/api.types.ts` para un 100% de type-safety.

  // src/demos/mi-nueva-demo/mi-nueva-demo.handlers.ts
  import { http, HttpResponse, delay, type HttpHandler } from 'msw';
  import type { paths } from '../../generated/api.types';
  // import { db } from './mi-nueva-demo.db'; // (Si tienes DB)

  // Tipado para nuestros endpoints
  type GetMisDatosResponse = paths['/api/mi-ruta']['get']['responses']['200']['content']['application/json'];

  export const miNuevaDemoHandlers: HttpHandler[] = [
  /\*\*
  _ GET: /api/mi-ruta
  _ Obtiene mis datos
  \*/
  http.get('/api/mi-ruta', async () => {
  await delay(200);
  const data: GetMisDatosResponse = { id: '123', value: 42 };
  return HttpResponse.json(data);
  }),

      // ...otros handlers (post, put, graphql, ws)

  ];

#### `[demo-name].db.ts` (Opcional)

Define y exporta la "base de datos" en memoria para esta demo.

    // src/demos/mi-nueva-demo/mi-nueva-demo.db.ts
    import { faker } from '@faker-js/faker';

    // Tipos locales o importados de .handlers.ts
    interface MiDato {
      id: string;
      value: number;
    }

    // Usar un Map para simular una DB de tipo Key-Value
    export const miDemoDb = new Map<string, MiDato>();

    // Función para poblar la DB
    function seed() {
      miDemoDb.clear();
      for (let i = 0; i < 5; i++) {
        const newDato: MiDato = {
          id: faker.string.uuid(),
          value: faker.number.int({ min: 1, max: 100 }),
        };
        miDemoDb.set(newDato.id, newDato);
      }
    }

    // Poblar la DB al iniciar
    seed();
