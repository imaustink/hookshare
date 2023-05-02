import nock from 'nock';
import supertest from 'supertest';
import { server, webSocketServer } from '../src/relay/relay.js';
import { client } from '../src/client/client.js';

const { HTTP_PORT } = process.env;

const target = 'http://localhost';

// Setup supertest so we can emulate ingress from 3rd party WebHooks to the relay
const request = supertest(server);

beforeAll(async () => {
  // Setup relay server
  await new Promise((resolve) => {
    server.listen(HTTP_PORT, resolve);
  });
  // Setup client connections
  await new Promise((resolve) => {
    client.once('connect', resolve);
    client.connect();
  });
});

afterAll(() => {
  // Cleanup
  client.close();
  server.close();
});

// Setup listener for response before the test executes or might miss it
let responsePromise;
beforeEach(() => {
  responsePromise = new Promise((resolve) => {
    webSocketServer.once('message', resolve);
  });
});

describe('static response', () => {
  // Setup nock to assert egress from the client
  const scopeSmokeTest = nock(target).post('/test').reply(200);
  const scopeParamTest = nock(target).post('/test/some-identifier').reply(200);
  test('should forward request and respond', async () => {
    // Emulate an incoming WebHook
    await request.post('/test').expect(200, { status: 'OK' });

    // Assert that we received the forwarded request
    scopeSmokeTest.done();

    // Wait for the client to respond with response details
    const result = await responsePromise;

    // Assert response details
    expect(result.payload).toEqual({
      data: '',
      headers: {},
      status: 200,
      statusText: null,
    });
  });

  test('should forward path params', async () => {
    // Emulate an incoming WebHook
    await request.post('/test/some-identifier').expect(201);

    // Assert that we received the forwarded request
    scopeParamTest.done();

    // Wait for the client to respond with response details
    const result = await responsePromise;

    // Assert response details
    expect(result.payload).toEqual({
      data: '',
      headers: {},
      status: 200,
      statusText: null,
    });
  });
});

describe('random-client response', () => {
  const body = { foo: 'bar' };
  // Setup nock to assert egress from the client
  const scopeRandomClient = nock(target).get('/random').reply(200, body);
  test('should forward request and respond', async () => {
    // Emulate an incoming WebHook
    await request.get('/random').expect(200, body);

    // Assert that we received the forwarded request
    scopeRandomClient.done();

    // Wait for the client to respond with response details
    const result = await responsePromise;

    // Assert response details
    expect(result.payload).toEqual({
      data: body,
      headers: {
        'content-type': 'application/json',
      },
      status: 200,
      statusText: null,
    });
  });
});

describe('successful-client response', () => {
  const body = { foo: 'bar' };
  // Setup nock to assert egress from the client
  const scopeRandomClient = nock(target).post('/success').reply(201, body);
  test('should forward request and respond', async () => {
    // Emulate an incoming WebHook
    await request.post('/success').expect(201, body);

    // Assert that we received the forwarded request
    scopeRandomClient.done();

    // Wait for the client to respond with response details
    const result = await responsePromise;

    // Assert response details
    expect(result.payload).toEqual({
      data: body,
      headers: {
        'content-type': 'application/json',
      },
      status: 201,
      statusText: null,
    });
  });
});
