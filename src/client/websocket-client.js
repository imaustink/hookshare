import WebSocket from 'websocket';
import { logger } from '../utils/logger.js';

export class WebSocketClient extends WebSocket.client {
  constructor(hostname) {
    super();

    this.#hostname = hostname;

    this.on('connectFailed', (error) => {
      this.#handleConnectionFailed(error);
    });

    this.on('connect', (connection) => {
      this.#handleConnection(connection);
    });
  }

  #hostname = null;
  #connectionAttemptCount = 0;
  maxRetries = 5;
  retryInterval = 5000;
  isConnecting = false;
  #connection = null;
  #started = false;

  connect(subProtocol = null) {
    logger.info(`Connecting to ${this.#hostname}...`);
    this.#started = true;
    this.isConnecting = true;
    this.#connectionAttemptCount++;
    super.connect(this.#hostname, subProtocol);
  }

  close() {
    this.#started = false;
    this.#connection.close();
  }

  send(message) {
    this.#connection.sendUTF(JSON.stringify(message));
  }

  #handleConnectionFailed(error) {
    logger.error('Failed to connect', error);
    this.isConnecting = false;
    this.#connection = null;
    if (this.#started && this.#connectionAttemptCount < this.maxRetries) {
      setTimeout(() => this.connect(), this.retryInterval);
    }
  }

  #handleConnection(connection) {
    logger.debug('Connected to relay');
    this.#connectionAttemptCount = 0;
    this.#connection = connection;
    this.isConnecting = false;

    connection.on('error', (error) => {
      logger.error('Connection lost', error);
      this.#handleConnectionFailed();
    });
    connection.on('close', () => {
      logger.debug('Connection closed!');
    });
    connection.on('message', (messageHandle) => {
      if (messageHandle.type === 'utf8') {
        const { uuid, type, payload } = JSON.parse(messageHandle.utf8Data);
        this.emit('message', payload, (response) => {
          this.send({ uuid, type, payload: response });
        });
      }
    });
  }
}
