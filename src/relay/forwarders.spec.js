import { v4 as createUuid } from 'uuid';
import { StandardForward, FORWARD_HTTP } from './forwarders';

describe('StandardForward class', () => {
  test('should exclude content-length from serialized request', () => {
    const forward = {
      target: 'http://localhost',
    };
    const pathname = '/test';
    const method = 'POST';
    const body = { status: 'complete' };
    const query = { foo: 'bar' };
    const uuid = createUuid();
    const headers = { 'content-type': 'application/json' };

    const standardForward = new StandardForward(
      {
        request: {
          headers: {
            ...headers,
            'content-length': '300',
          },
          body,
        },
        path: pathname,
        method,
        query,
        state: {
          uuid,
        },
      },
      forward
    );
    expect(standardForward.toJSON()).toMatchObject({
      type: FORWARD_HTTP,
      uuid,
      payload: {
        forward,
        headers,
        pathname,
        method,
        body,
        query,
      },
    });
  });
});
