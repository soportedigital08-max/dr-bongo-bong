// Entry point for standalone output on cPanel Node.js App Manager
// Usage: node .next/standalone/server.js
// The standalone bundle exports the request handler directly.

const http = require('http');

let handler;
try {
  // Preferred: standalone bundle exposes the Next.js request handler
  const mod = require('./.next/standalone/server.js');
  handler = mod.default || mod;
} catch (e) {
  console.error('Failed to load standalone server bundle:', e.message);
  process.exit(1);
}

const port = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  try {
    const response = await handler(req, res);
    if (response && typeof response.pipe === 'function') {
      response.pipe(res);
    } else if (response && response.statusCode !== undefined) {
      res.writeHead(response.statusCode, response.headers);
      if (response.body) response.body.pipe(res);
    }
  } catch (err) {
    console.error('Request error:', err);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }
});

server.listen(port, () => {
  console.log(`Ready: http://0.0.0.0:${port}`);
});
