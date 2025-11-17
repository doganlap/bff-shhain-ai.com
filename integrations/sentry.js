/**
 * Sentry Error Tracking Integration
 * Provides real-time error monitoring and alerting
 */

const Sentry = require('@sentry/node');

/**
 * Initialize Sentry
 */
function initSentry(app) {
  if (!process.env.SENTRY_DSN || process.env.SENTRY_ENABLED !== 'true') {
    console.log('[Sentry] Error tracking disabled');
    return;
  }
  let ProfilingIntegration = null;
  try { ProfilingIntegration = require('@sentry/profiling-node').ProfilingIntegration } catch (e) { void e; }
  const integrations = [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ];
  if (ProfilingIntegration) { integrations.push(new ProfilingIntegration()) }
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations,
    beforeSend(event, hint) {
      if (event.request) {
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }
        if (event.request.query_string) {
          event.request.query_string = event.request.query_string
            .replace(/token=[^&]*/gi, 'token=***')
            .replace(/password=[^&]*/gi, 'password=***');
        }
      }
      if (hint.originalException?.tenantId) {
        event.tags = event.tags || {};
        event.tags.tenant_id = hint.originalException.tenantId;
      }
      return event;
    },
    ignoreErrors: [
      'NetworkError',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded'
    ]
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  console.log('[Sentry] Error tracking initialized');
}

/**
 * Error handler middleware (must be before other error handlers)
 */
function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture 4xx and 5xx errors
      return error.statusCode >= 400;
    },
  });
}

/**
 * Capture exception with context
 */
function captureException(error, context = {}) {
  if (process.env.SENTRY_ENABLED !== 'true') {
    return;
  }

  Sentry.withScope((scope) => {
    // Add context
    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        tenant_id: context.user.tenantId,
      });
    }
    
    if (context.tenantId) {
      scope.setTag('tenant_id', context.tenantId);
    }
    
    if (context.requestId) {
      scope.setTag('request_id', context.requestId);
    }
    
    if (context.extra) {
      scope.setContext('additional', context.extra);
    }
    
    // Capture the exception
    Sentry.captureException(error);
  });
}

/**
 * Capture message with severity
 */
function captureMessage(message, level = 'info', context = {}) {
  if (process.env.SENTRY_ENABLED !== 'true') {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    
    if (context.tenantId) {
      scope.setTag('tenant_id', context.tenantId);
    }
    
    if (context.extra) {
      scope.setContext('additional', context.extra);
    }
    
    Sentry.captureMessage(message);
  });
}

/**
 * Start a performance transaction
 */
function startTransaction(name, op) {
  if (process.env.SENTRY_ENABLED !== 'true') {
    return null;
  }

  return Sentry.startTransaction({
    name,
    op,
  });
}

module.exports = {
  initSentry,
  sentryErrorHandler,
  captureException,
  captureMessage,
  startTransaction,
  Sentry,
};
