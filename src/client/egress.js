import https from 'https';
import axios from 'axios';
import { logger } from '../utils/logger.js';

export async function initiateEgressRequest(options) {
  const { forward, pathname, headers, method, body, query, uuid } = options;
  const url = new URL(`${forward.target}${pathname}`);

  const maybeDisableSslVerification = forward.disableSslVerification &&
    url.protocol === 'https:' && {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

  if (query) {
    const urlSearchParams = new URLSearchParams(query);
    url.search = urlSearchParams;
  }

  logger.info({
    suffix: `(${uuid})`,
    message: `<-- ${method} ${url.toString()}`,
  });

  const response = await axios({
    url,
    headers,
    data: body,
    method,
    ...maybeDisableSslVerification,
  });

  return response;
}
