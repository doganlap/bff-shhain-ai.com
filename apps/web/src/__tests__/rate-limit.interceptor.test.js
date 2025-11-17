import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { api } from '@/services/api'

describe('Rate limit interceptor', () => {
  let origAdapter
  let capturedError

  beforeEach(() => {
    origAdapter = api.defaults.adapter
    api.defaults.adapter = async (config) => {
      const err = {
        isAxiosError: true,
        response: {
          status: 429,
          headers: { 'retry-after': '900' },
          data: { message: 'Too many requests' },
        },
        config,
      }
      throw err
    }
  })

  afterEach(() => {
    api.defaults.adapter = origAdapter
    capturedError = null
  })

  it('produces a RATE_LIMIT_ERROR with retryAfter from headers', async () => {
    try {
      await api.post('/auth/login', { email: 'e@example.com', password: 'wrong' })
    } catch (err) {
      capturedError = err
    }
    expect(capturedError).toBeTruthy()
    expect(capturedError.type).toBe('RATE_LIMIT_ERROR')
    expect(capturedError.retryAfter).toBe(900)
  })
})