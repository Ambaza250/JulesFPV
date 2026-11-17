import app from './index.js';

/**
 * Vercel serverless entry. After a rewrite of /api/* -> /api,
 * req.url may become just "/api". Restore the original path so
 * Express route matching still works for nested routes.
 */
export default function vercelHandler(req, res) {
  // Prefer headers that still carry the client path
  const original =
    req.headers['x-invoke-path'] ||
    req.headers['x-forwarded-uri'] ||
    req.headers['x-vercel-original-url'] ||
    req.url ||
    '/';

  // Keep only the pathname (+ search if present)
  let path = original;
  try {
    if (path.startsWith('http')) path = new URL(path).pathname + (new URL(path).search || '');
  } catch (_) {}

  // Ensure Express sees a path under /api
  if (!path.startsWith('/api')) {
    path = `/api${path.startsWith('/') ? path : `/${path}`}`;
  }

  req.url = path;
  return app(req, res);
}
