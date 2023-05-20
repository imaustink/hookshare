export const FORWARD_HTTP = 'http-forward';

export class HTTPForwarderBase {
  type = FORWARD_HTTP;
  constructor(ctx, forward) {
    const headers = { ...ctx.request.headers };
    delete headers['content-length'];

    this.forward = forward;
    this.headers = headers;
    this.pathname = ctx.path;
    this.method = ctx.method;
    this.body = ctx.request.body;
    this.query = ctx.query;
    this.uuid = ctx.state.uuid;
  }

  toJSON() {
    return {
      type: this.type,
      uuid: this.uuid,
      payload: this.payload,
    };
  }
}

export class StandardForward extends HTTPForwarderBase {
  get payload() {
    return {
      forward: this.forward,
      headers: this.headers,
      pathname: this.pathname,
      method: this.method,
      body: this.body,
      query: this.query,
    };
  }
}
