import app from './index.js';

export default function vercelHandler(req, res) {
  const incomingUrl = req.url || '/';
  if (!incomingUrl.startsWith('/api')) {
    req.url = `/api${incomingUrl.startsWith('/') ? incomingUrl : `/${incomingUrl}`}`;
  }
  return app(req, res);
}
