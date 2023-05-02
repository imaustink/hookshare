import createError from 'http-errors';

export class BaseResponder {
  constructor(config, responses) {
    this.config = config;
    this.responses = responses;
  }

  respond(ctx) {
    this.setBody(ctx);
    this.setStatus(ctx);
    this.setHeaders(ctx);
  }
}

export class StaticResponder extends BaseResponder {
  setBody(ctx) {
    ctx.body = this.config.body;
  }

  setStatus(ctx) {
    ctx.status = this.config.status;
  }

  setHeaders(ctx) {
    Object.entries(this.config.headers).forEach(([key, value]) => {
      ctx.set(key, value);
    });
  }
}

export class RandomClientResponder extends BaseResponder {
  constructor(...args) {
    super(...args);
    if (!this.responses.length) {
      throw createError(502);
    }
    const randomPickIndex = Math.floor(Math.random() * this.responses.length);
    this.#randomPick = this.responses[randomPickIndex];
  }

  #randomPick = null;

  setBody(ctx) {
    ctx.body = this.#randomPick.data;
  }

  setStatus(ctx) {
    ctx.status = this.#randomPick.status;
  }

  setHeaders(ctx) {
    Object.entries(this.#randomPick.headers).forEach(([key, value]) => {
      ctx.set(key, value);
    });
  }
}

export class SuccessfulClient extends BaseResponder {
  constructor(...args) {
    super(...args);
    if (!this.responses.length) {
      throw createError(502);
    }
    this.#success = this.responses.find(({ status }) => {
      return status === this.config.expectedStatus;
    });
  }

  #success = null;

  setBody(ctx) {
    ctx.body = this.#success.data;
  }

  setStatus(ctx) {
    ctx.status = this.#success.status;
  }

  setHeaders(ctx) {
    Object.entries(this.#success.headers).forEach(([key, value]) => {
      ctx.set(key, value);
    });
  }
}

export const responders = {
  static: StaticResponder,
  'random-client': RandomClientResponder,
  'successful-client': SuccessfulClient,
};
