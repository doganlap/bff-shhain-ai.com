// Sandbox/Playground Service - Create temporary demo sessions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api'
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io'

/**
 * Create a temporary sandbox session for visitor
 * Generates a demo account with pre-populated data
 * @param {Object} visitorInfo - Optional visitor info (email, name)
 * @returns {Promise<Object>} Sandbox session with access token and URL
 */
export const createSandboxSession = async (visitorInfo = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sandbox/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: visitorInfo.email || `demo_${Date.now()}@sandbox.shahin.local`,
        name: visitorInfo.name || `Demo User ${Date.now()}`,
        source: 'landing-page',
        sessionType: 'playground', // 'playground', 'demo', or 'poc'
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
        features: {
          aiAgents: true,
          assessments: true,
          frameworks: true,
          dashboards: true,
          reports: true
        },
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          referrer: document.referrer,
          createdAt: new Date().toISOString()
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Store session info locally for tracking
    storeSandboxSession(data)
    
    // Track sandbox creation
    trackSandboxEvent('sandbox_created', data.sessionId)
    
    return {
      success: true,
      sessionId: data.sessionId,
      accessToken: data.accessToken,
      sandboxUrl: `${FRONTEND_URL}/sandbox?token=${data.accessToken}`,
      expiresAt: data.expiresAt,
      username: data.username,
      password: data.password, // Temporary password
      message: data.message
    }
  } catch (error) {
    console.error('Sandbox session creation error:', error)
    
    // Track error
    trackSandboxEvent('sandbox_error', error.message)
    
    throw new Error('Failed to create sandbox session. Please try again or contact support.')
  }
}

/**
 * Quick access sandbox without any form
 * Opens directly in new tab
 * @returns {Promise<void>}
 */
export const quickAccessSandbox = async () => {
  try {
    const session = await createSandboxSession()
    
    // Open in new tab
    window.open(session.sandboxUrl, '_blank', 'noopener,noreferrer')
    
    return session
  } catch (error) {
    console.error('Quick access sandbox error:', error)
    alert('Unable to create sandbox session. Please try again.')
    throw error
  }
}

/**
 * Request a guided demo with booking
 * Combines sandbox creation with demo booking
 * @param {Object} bookingData - Booking form data
 * @returns {Promise<Object>} Sandbox session + booking confirmation
 */
export const requestGuidedDemo = async (bookingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sandbox/guided-demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...bookingData,
        createSandbox: true,
        sessionType: 'demo'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Store session
    storeSandboxSession(data.sandboxSession)
    
    // Track guided demo request
    trackSandboxEvent('guided_demo_requested', data.bookingId)
    
    return {
      success: true,
      bookingId: data.bookingId,
      sandboxSession: data.sandboxSession,
      message: data.message
    }
  } catch (error) {
    console.error('Guided demo request error:', error)
    throw new Error('Failed to request guided demo. Please try again.')
  }
}

/**
 * Send feedback from sandbox session
 * @param {string} sessionId - Sandbox session ID
 * @param {Object} feedback - Feedback data
 * @returns {Promise<Object>} Response
 */
export const sendSandboxFeedback = async (sessionId, feedback) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sandbox/${sessionId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        rating: feedback.rating, // 1-5
        experience: feedback.experience, // 'excellent', 'good', 'fair', 'poor'
        features: feedback.features, // Array of liked features
        issues: feedback.issues, // Array of encountered issues
        suggestions: feedback.suggestions, // Text feedback
        wouldRecommend: feedback.wouldRecommend, // Boolean
        interestedInPurchase: feedback.interestedInPurchase, // Boolean
        contactForFollowup: feedback.contactForFollowup, // Boolean
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Track feedback submission
    trackSandboxEvent('feedback_submitted', sessionId, feedback.rating)
    
    return {
      success: true,
      message: data.message
    }
  } catch (error) {
    console.error('Sandbox feedback error:', error)
    throw new Error('Failed to send feedback.')
  }
}

/**
 * Send general contact message
 * @param {Object} contactData - Contact form data
 * @returns {Promise<Object>} Response
 */
export const sendContactMessage = async (contactData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        subject: contactData.subject,
        message: contactData.message,
        type: contactData.type || 'general', // 'general', 'sales', 'support', 'partnership'
        timestamp: new Date().toISOString(),
        source: 'landing-page'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Track contact submission
    trackSandboxEvent('contact_submitted', contactData.type)
    
    return {
      success: true,
      message: data.message,
      ticketId: data.ticketId
    }
  } catch (error) {
    console.error('Contact message error:', error)
    throw new Error('Failed to send message. Please try again or email us directly.')
  }
}

/**
 * Store sandbox session info locally
 * @param {Object} session - Sandbox session data
 */
const storeSandboxSession = (session) => {
  try {
    const sessions = JSON.parse(localStorage.getItem('sandbox_sessions') || '[]')
    sessions.push({
      sessionId: session.sessionId,
      accessToken: session.accessToken,
      username: session.username,
      createdAt: new Date().toISOString(),
      expiresAt: session.expiresAt,
      type: session.sessionType || 'playground'
    })
    // Keep only last 5 sessions
    if (sessions.length > 5) {
      sessions.shift()
    }
    localStorage.setItem('sandbox_sessions', JSON.stringify(sessions))
  } catch (error) {
    console.error('Failed to store sandbox session locally:', error)
  }
}

/**
 * Get recent sandbox sessions
 * @returns {Array} Recent sandbox sessions
 */
export const getRecentSandboxSessions = () => {
  try {
    const sessions = JSON.parse(localStorage.getItem('sandbox_sessions') || '[]')
    // Filter out expired sessions
    const now = new Date()
    return sessions.filter(s => new Date(s.expiresAt) > now)
  } catch (error) {
    console.error('Failed to get sandbox sessions:', error)
    return []
  }
}

/**
 * Reopen existing sandbox session
 * @param {string} sessionId - Session ID
 * @returns {void}
 */
export const reopenSandboxSession = (sessionId) => {
  const sessions = getRecentSandboxSessions()
  const session = sessions.find(s => s.sessionId === sessionId)
  
  if (session) {
    window.open(
      `${FRONTEND_URL}/sandbox?token=${session.accessToken}`,
      '_blank',
      'noopener,noreferrer'
    )
    trackSandboxEvent('sandbox_reopened', sessionId)
  }
}

/**
 * Track sandbox events for analytics
 * @param {string} eventName - Event name
 * @param {string} value - Additional value
 * @param {any} extraData - Extra data
 */
const trackSandboxEvent = (eventName, value, extraData = null) => {
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'Sandbox',
      event_label: value,
      value: extraData,
      timestamp: new Date().toISOString()
    })
  }
  
  // Azure Application Insights
  if (window.appInsights) {
    window.appInsights.trackEvent({
      name: eventName,
      properties: {
        value: value,
        extraData: extraData,
        source: 'landing-page'
      }
    })
  }
  
  // Console log for development
  if (import.meta.env?.MODE === 'development') {
    console.log(`[Sandbox Event] ${eventName}:`, value, extraData)
  }
}

/**
 * Check if user has active sandbox sessions
 * @returns {boolean} Has active sessions
 */
export const hasActiveSandboxSessions = () => {
  return getRecentSandboxSessions().length > 0
}

/**
 * Clear all expired sandbox sessions from storage
 */
export const clearExpiredSessions = () => {
  const activeSessions = getRecentSandboxSessions()
  localStorage.setItem('sandbox_sessions', JSON.stringify(activeSessions))
}

// Auto-clear expired sessions on load
clearExpiredSessions()

export default {
  createSandboxSession,
  quickAccessSandbox,
  requestGuidedDemo,
  sendSandboxFeedback,
  sendContactMessage,
  getRecentSandboxSessions,
  reopenSandboxSession,
  hasActiveSandboxSessions,
  clearExpiredSessions
}


