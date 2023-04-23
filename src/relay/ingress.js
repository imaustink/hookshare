import { v4 as createUuid } from 'uuid';
import { minimatch } from 'minimatch';
import { logger } from '../utils/logger.js';

export function getIngressRouter(getConfig, handleForward, handleResponse) {
  return async (ctx, next) => {
    const uuid = createUuid();
    ctx.state.uuid = uuid;
    logger.info({
      suffix: `(${uuid})`,
      message: `--> ${ctx.method} ${ctx.origin}${ctx.path}`,
    });
    const config = getConfig();
    const matchedPath = Object.keys(config.routes).find((pathname) =>
      minimatch(ctx.path, pathname)
    );
    const routeConfig = config.routes[matchedPath];
    if (routeConfig) {
      const { response, forward } = routeConfig;
      const clientResponses = await handleForward(ctx, forward);
      if (response) {
        await handleResponse(ctx, response, clientResponses);
      }
    }

    await next();
  };
}
