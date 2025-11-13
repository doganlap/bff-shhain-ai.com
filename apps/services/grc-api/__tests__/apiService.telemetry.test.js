jest.mock('axios');

const loadServiceModule = () => {
  jest.resetModules();
  const mockedAxios = require('axios');
  mockedAxios.__reset();
  const serviceModule = require('../../services/apiService');
  const apiService = serviceModule.default || serviceModule;
  return {
    apiService,
    telemetry: serviceModule.telemetry,
  };
};

const setHandler = (fn) => {
  const mockedAxios = require('axios');
  const instance = mockedAxios.__getLastInstance();
  if (!instance) {
    throw new Error('Axios instance was not initialized');
  }
  instance.__setHandler(fn);
  return instance;
};

describe('apiService telemetry', () => {
  test('emits request and response events for successful calls', async () => {
    const { apiService, telemetry } = loadServiceModule();

    setHandler((config) =>
      Promise.resolve({
        data: { data: [{ id: 'org-1', name: 'Test Org' }] },
        status: 200,
        headers: { 'x-request-id': 'server-id' },
        config,
      })
    );

    const events = [];
    const unsubscribe = telemetry.subscribe((event, payload) => {
      events.push({ event, payload });
    });

    const organizations = await apiService.organizations.getAll();
    unsubscribe();

    expect(organizations.data).toEqual([
      expect.objectContaining({ id: 'org-1', name: 'Test Org' }),
    ]);
    expect(events.map((evt) => evt.event)).toEqual(['api:request', 'api:response']);
    expect(events[0].payload.method).toBe('GET');
    expect(events[1].payload.status).toBe(200);
  });

  test('emits error telemetry when the request fails', async () => {
    const { apiService, telemetry } = loadServiceModule();

    setHandler((config) =>
      Promise.reject({
        config,
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
          headers: { 'x-request-id': 'error-id' },
        },
      })
    );

    const events = [];
    const unsubscribe = telemetry.subscribe((event, payload) => {
      events.push({ event, payload });
    });

    await expect(apiService.organizations.getAll()).rejects.toThrow('Unauthorized');
    unsubscribe();

    const errorEvent = events.find((evt) => evt.event === 'api:error');
    expect(errorEvent).toBeDefined();
    expect(errorEvent.payload.status).toBe(401);
    expect(errorEvent.payload.message).toBe('Unauthorized');
  });
});
