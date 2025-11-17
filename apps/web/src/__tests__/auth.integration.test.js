import axios from 'axios'
import { describe, it, expect, beforeAll } from 'vitest'

const BASE = process.env.BFF_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

function randomEmail() {
  const id = Math.random().toString(36).slice(2)
  return `test_${id}@example.com`
}

describe('Auth integration', () => {
  let creds = {
    email: randomEmail(),
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
    organizationName: 'Test Org',
  }

  it('registers a new user', async () => {
    const res = await api.post('/auth/register', creds)
    expect(res.status).toBe(201)
    expect(res.data?.success).toBe(true)
    expect(res.data?.data?.user?.email).toBe(creds.email)
  })

  it('logs in and sets cookie, then /auth/me returns user', async () => {
    const login = await api.post('/auth/login', { email: creds.email, password: creds.password })
    expect(login.status).toBe(200)
    expect(login.data?.success).toBe(true)
    expect(login.data?.data?.user?.email).toBe(creds.email)

    // Call /auth/me, expecting 200 and same user
    const me = await api.get('/auth/me')
    expect(me.status).toBe(200)
    expect(me.data?.success).toBe(true)
    expect(me.data?.data?.user?.email).toBe(creds.email)
  })

  it('rate limits repeated failed logins', async () => {
    let lastStatus = 200
    for (let i = 0; i < 11; i++) {
      try {
        await api.post('/auth/login', { email: creds.email, password: 'wrong' })
      } catch (err) {
        lastStatus = err?.response?.status || 0
      }
    }
    expect(lastStatus).toBe(429)
  })
})