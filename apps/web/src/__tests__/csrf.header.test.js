import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { api } from '@/services/api'

describe('CSRF header attachment (production)', () => {
  let origAdapter
  let capturedConfig
  const origNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    process.env.NODE_ENV = 'production'
    // Stub cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrfToken=test_csrf_token; other=val',
    })
    // Capture requests and avoid network calls
    origAdapter = api.defaults.adapter
    api.defaults.adapter = async (config) => {
      capturedConfig = config
      return { data: {}, status: 200, headers: {}, config }
    }
  })

  afterEach(() => {
    process.env.NODE_ENV = origNodeEnv
    api.defaults.adapter = origAdapter
    capturedConfig = null
  })

  it('sets X-CSRF-Token on POST requests in production', async () => {
    await api.post('/auth/login', { email: 'x@example.com', password: 'p' })
    expect(capturedConfig?.headers?.['X-CSRF-Token']).toBe('test_csrf_token')
  })

  it('does not set X-CSRF-Token on GET requests', async () => {
    await api.get('/auth/me')
    expect(capturedConfig?.headers?.['X-CSRF-Token']).toBeUndefined()
  })
})