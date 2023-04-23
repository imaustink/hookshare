import { WebSocketClient } from './websocket-client.js';
import { initiateEgressRequest } from './egress.js';
import { logger } from '../utils/logger.js';
import { FORWARD_HTTP } from '../relay/forwarders.js';

const { RELAY_HOSTNAME = 'ws://localhost:8080' } = process.env;

export const client = new WebSocketClient(RELAY_HOSTNAME);

client.on('message', (messageHandle, reply) => {
  handleMessage(messageHandle, reply).catch((error) => logger.error(error));
});

export async function handleMessage(message, reply) {
  if (message.type === FORWARD_HTTP) {
    const result = await initiateEgressRequest(message.payload);
    const { data, status, statusText, headers, request } = result;
    logger.debug(request);
    reply({
      data,
      status,
      statusText,
      headers,
    });
  }
}
