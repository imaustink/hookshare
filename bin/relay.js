#!/usr/bin/env node

import { server } from '../src/relay/relay.js';
import { logger } from '../src/utils/logger.js';

const { HTTP_PORT = '8080' } = process.env;

server.listen(HTTP_PORT, () => {
  logger.info(`Relay is listening on port ${HTTP_PORT}`);
});
