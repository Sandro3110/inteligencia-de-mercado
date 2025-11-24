import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.epicplay.com",
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    "http://loading.retry.widdit.com/",
    "atomicFindClose",
    // Network errors
    "NetworkError",
    "Network request failed",
    "Failed to fetch",
    // Random plugins/extensions
    "window.webkit.messageHandlers",
  ],

  beforeSend(event, hint) {
    // Filter out localhost errors in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Check if it's an error from a browser extension
    if (event.exception) {
      const frames = event.exception.values?.[0]?.stacktrace?.frames;
      if (frames && frames.some((frame) => frame.filename?.includes("extension://"))) {
        return null;
      }
    }

    return event;
  },
});
