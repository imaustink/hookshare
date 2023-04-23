export const FORWARD_HTTP = 'http-forward';

export class BaseForwarder {
  constructor(ctx, forward) {
    this.ctx = ctx;
    this.forward = forward;
  }

  toJSON() {
    return {
      type: this.type,
      payload: this.payload,
    };
  }
}

export class StandardForward extends BaseForwarder {
  type = FORWARD_HTTP;
  get payload() {
    const { ctx, forward } = this;
    return {
      forward,
      pathname: ctx.path,
      headers: ctx.request.headers,
      method: ctx.method,
      body: ctx.request.body,
      query: ctx.query,
      uuid: ctx.state.uuid,
    };
  }
}
