import type { HttpHandler } from 'msw';
// import { ecommerceHandlers } from './demos/ecommerce/ecommerce.handlers';
// import { geosocialHandlers } from './demos/geosocial/geosocial.handlers';
// import { chatHandlers } from './demos/chat/chat.handlers';
// import { graphqlHandlers } from './demos/graphql/graphql.handlers';
// import { websocketHandlers } from './demos/websocket/websocket.handlers';

/**
 * Array con todos los handlers de MSW combinados.
 * A medida que creemos nuevos módulos en /demos, los importamos
 * y añadimos a este array.
 */
export const allHandlers: HttpHandler[] = [
  // ...ecommerceHandlers,
  // ...geosocialHandlers,
  // ...chatHandlers,
  // ...graphqlHandlers,
  // ...websocketHandlers,
];
