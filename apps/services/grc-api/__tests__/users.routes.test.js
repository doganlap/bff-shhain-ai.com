const request = require('supertest');
const express = require('express');
const usersRouter = require('../routes/users');
const setupMockDb = require('./mockDatabase');

let mockPool;
let db;

jest.mock('../config/database', () => {
  return {
    __esModule: true,
    default: {
      query: (...args) => mockPool.query(...args),
      connect: (...args) => mockPool.connect(...args),
    },
    testConnection: jest.fn(),
  };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => 'hashed-password'),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'generated-user-id'),
}));

jest.mock('../middleware/auth', () => {
  const decodeUser = (req) => {
    const header = req.headers['x-test-user'];
    if (!header) return null;
    try {
      const json = Buffer.from(header, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const ensureAuthenticated = (req, res) => {
    if (req.user) return req.user;
    const user = decodeUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
      });
      return null;
    }
    req.user = user;
    return user;
  };

  return {
    authenticateToken: (req, res, next) => {
      const user = ensureAuthenticated(req, res);
      if (user) next();
    },
    requireRole: (allowedRoles) => (req, res, next) => {
      const user = ensureAuthenticated(req, res);
      if (!user) return;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
      }
      next();
    },
    requireOrganizationAccess: () => (req, res, next) => next(),
    requirePermission: () => (req, res, next) => next(),
    optionalAuth: (req, res, next) => next(),
    userRateLimit: () => (req, res, next) => next(),
  };
});

const encodeUser = (user) =>
  Buffer.from(JSON.stringify(user)).toString('base64');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/users', usersRouter);
  return app;
};

describe('Users API', () => {
  const app = makeApp();
  const ORG_ID = '11111111-1111-1111-1111-111111111111';
  const TARGET_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const adminUser = {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    role: 'super_admin',
    organization_id: ORG_ID,
  };
  const adminHeader = encodeUser(adminUser);

  beforeAll(async () => {
    ({ db, mockPool } = setupMockDb());
    const schema = require('fs').readFileSync(require('path').join(__dirname, '../database/base_schema.sql'), 'utf8');
    await db.public.query(schema);
  });

  beforeEach(async () => {
    // Clean the users table before each test
    await db.public.query('TRUNCATE TABLE users CASCADE');
  });

  afterAll(() => {
    db.close();
  });

  test('lists users for admins with sanitized payloads', async () => {
    // Seed the in-memory database
    await db.public.query(
      `INSERT INTO users (id, name, email, password_hash, role, organization_id) VALUES 
       ('user-1', 'Test User 1', 'user1@test.com', 'hashed', 'user', '${ORG_ID}'),
       ('user-2', 'Test User 2', 'user2@test.com', 'hashed', 'admin', '${ORG_ID}')`
    );

    const response = await request(app)
      .get('/users')
      .set('x-test-user', adminHeader);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0]).not.toHaveProperty('password_hash');
  });

  test('gets a specific user by ID', async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: TARGET_ID,
            email: 'user@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'viewer',
            department: 'GRC',
            job_title: 'Analyst',
            permissions: '["view_controls"]',
            status: 'active',
            last_login: null,
            organization_id: ORG_ID,
            organization_name: 'Org One',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ total: '1' }],
      });

    const res = await request(app)
      .get(`/users/${TARGET_ID}`)
      .set('x-test-user', adminHeader);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: TARGET_ID,
      email: 'user@example.com',
      permissions: ['view_controls'],
      organization_id: ORG_ID,
    });
  });

  test('creates a user scoped to admin organization', async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [{ id: ORG_ID }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'generated-user-id',
            email: 'new.user@example.com',
            first_name: 'New',
            last_name: 'User',
            role: 'viewer',
            organization_id: ORG_ID,
            department: 'Ops',
            job_title: 'Specialist',
            permissions: '[]',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        ],
        rowCount: 1,
      });

    const payload = {
      email: 'new.user@example.com',
      password: 'StrongPass1!',
      first_name: 'New',
      last_name: 'User',
      organization_id: ORG_ID,
      role: 'viewer',
      department: 'Ops',
      job_title: 'Specialist',
      permissions: ['view_controls'],
    };

    const res = await request(app)
      .post('/users')
      .set('x-test-user', adminHeader)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      id: 'generated-user-id',
      email: payload.email,
      organization_id: ORG_ID,
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(
      payload.password,
      expect.any(Number)
    );
    expect(uuidv4).toHaveBeenCalled();
  });

  test('prevents non-admins from updating other people', async () => {
    const viewerHeader = encodeUser({
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      role: 'viewer',
      organization_id: ORG_ID,
    });

    const res = await request(app)
      .put(`/users/${TARGET_ID}`)
      .set('x-test-user', viewerHeader)
      .send({ first_name: 'Blocked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/only modify your own account/i);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('updates profile fields when admin edits a user', async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: TARGET_ID,
            email: 'viewer@example.com',
            first_name: 'View',
            last_name: 'Er',
            role: 'viewer',
            organization_id: ORG_ID,
            permissions: '[]',
            status: 'active',
          },
        ],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: TARGET_ID,
            email: 'viewer@example.com',
            first_name: 'Updated',
            last_name: 'User',
            role: 'viewer',
            department: 'GRC',
            job_title: 'Lead',
            permissions: '[]',
            status: 'active',
            organization_id: ORG_ID,
          },
        ],
        rowCount: 1,
      });

    const res = await request(app)
      .put(`/users/${TARGET_ID}`)
      .set('x-test-user', adminHeader)
      .send({ first_name: 'Updated', department: 'GRC', job_title: 'Lead' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: TARGET_ID,
      first_name: 'Updated',
      department: 'GRC',
    });
  });

  test('resets passwords with admin privileges', async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: TARGET_ID,
            email: 'viewer@example.com',
            first_name: 'Reset',
            last_name: 'Target',
            organization_id: ORG_ID,
            permissions: '[]',
            status: 'active',
          },
        ],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: TARGET_ID,
            email: 'viewer@example.com',
            first_name: 'Reset',
            last_name: 'Target',
            organization_id: ORG_ID,
          },
        ],
        rowCount: 1,
      });

    const res = await request(app)
      .post(`/users/${TARGET_ID}/reset-password`)
      .set('x-test-user', adminHeader)
      .send({ newPassword: 'AnotherPass1!' });

    expect(res.status).toBe(200);
    expect(bcrypt.hash).toHaveBeenCalledWith('AnotherPass1!', expect.any(Number));
    expect(res.body.data.id).toBe(TARGET_ID);
  });

  test('soft deletes users for admins while keeping history', async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: TARGET_ID,
            email: 'viewer@example.com',
            first_name: 'Delete',
            last_name: 'Me',
            organization_id: ORG_ID,
            permissions: '[]',
            status: 'active',
          },
        ],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: TARGET_ID,
            email: 'viewer@example.com',
            first_name: 'Delete',
            last_name: 'Me',
            organization_id: ORG_ID,
            status: 'inactive',
          },
        ],
        rowCount: 1,
      });

    const res = await request(app)
      .delete(`/users/${TARGET_ID}`)
      .set('x-test-user', adminHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('inactive');
  });
});



