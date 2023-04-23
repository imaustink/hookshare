import http from 'http';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import { WebSocketServer } from './websocket-server.js';
import { getIngressRouter } from './ingress.js';
import { Configuration } from './configuration.js';
import { logger } from '../utils/logger.js';
import { responders } from './responders.js';
import { StandardForward } from './forwarders.js';
import { FORWARD_HTTP } from './forwarders.js';

const { CONFIG_PATH = 'config.json' } = process.env;

export const app = new Koa();
export const server = http.createServer(app.callback());
export const webSocketServer = new WebSocketServer({
  httpServer: server,
});
export const configuration = new Configuration({ configPath: CONFIG_PATH });

app.use(koaBody());
app.use(
  getIngressRouter(() => configuration.get(), handleForward, handleResponse)
);

webSocketServer.on('message', (message) => {
  logger.info(message.payload);
});

async function handleForward(ctx, forward) {
  const message = new StandardForward(ctx, forward);
  const clientResponses = await webSocketServer.broadcast(
    FORWARD_HTTP,
    message
  );
  return clientResponses;
}

async function handleResponse(ctx, responseConfig, clientResponses) {
  const MaybeResponder = responders[responseConfig.type];
  if (MaybeResponder) {
    const responder = new MaybeResponder(responseConfig, clientResponses);
    responder.respond(ctx);
  }
}
