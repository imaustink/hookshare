import { v4 as createUuid } from 'uuid';
import WebSocket from 'websocket';
import { logger } from '../utils/logger.js';

const { BROADCAST_RESPONSE_TIMEOUT_MS = '5000' } = process.env;

export class WebSocketServer extends WebSocket.server {
  constructor(options) {
    super(options);
    this.on('request', (request) => {
      this.#handleRequest(request);
    });
  }

  async broadcast(type, payload) {
    const uuid = createUuid();
    const message = { uuid, type, payload };
    this.#clients.forEach(({ connection }) => {
      connection.send(JSON.stringify(message));
    });

    const clientResponses = await new Promise((resolve) => {
      const responses = [];
      const handleClientResponse = (payload) => {
        responses.push(payload);
      };
      this.on(`response:${uuid}`, handleClientResponse);
      setTimeout(() => {
        resolve(responses);
        this.off(`response:${uuid}`, handleClientResponse);
      }, parseInt(BROADCAST_RESPONSE_TIMEOUT_MS));
    });

    return clientResponses;
  }

  #handleRequest(request) {
    const connection = request.accept(null, request.origin);
    const client = { connection, uuid: createUuid() };

    logger.info(`${connection.remoteAddress} connected.`);

    connection.on('message', (messageHandle) => {
      if (messageHandle.type === 'utf8') {
        const message = JSON.parse(messageHandle.utf8Data);
        this.emit('message', message);
        if (message.type) {
          this.emit(message.type, message.payload);
        }
        if (message.uuid) {
          this.emit(`response:${message.uuid}`, message.payload);
        }
      }
    });
    connection.on('close', (reasonCode, description) => {
      logger.debug(`${connection.remoteAddress} disconnected.`);
      const connectionIndex = this.#clients.indexOf(client);
      this.#clients.splice(connectionIndex, 1);
    });

    this.#clients.push(client);
  }

  #clients = [];
}
