// src/handlers/websocket.js
// Entry point for transport selection and parsing of options
const { parseFakeHeadersFromQuery, parseSNIFromQuery } = require('../utils/parser');
const { handleHttpUpgradeTransport, handleWebSocketTransport } = require('../proxy/transport-handlers');
const defaults = require('../config/defaults');

// This file assumes the project has an existing HTTP server that can call these handlers.
// Integration points depend on the current code base (e.g., express/ws, native http upgrade, or Cloudflare Workers).

async function handleIncomingUpgrade(req, socket, head) {
  // Called from HTTP server 'upgrade' event: (req, socket, head)
  const url = new URL(req.url, `http://${req.headers.host}`);
  const params = url.searchParams;

  const transport = params.get('transport') || 'ws';
  const fakeHeaders = defaults.ALLOW_FAKE_HEADERS ? Object.assign({}, defaults.DEFAULT_FAKE_HEADERS, parseFakeHeadersFromQuery(params)) : {};
  const sniParam = parseSNIFromQuery(params) || defaults.DEFAULT_FAKE_SNI || '';

  // Determine destination from query or path; project likely already has logic — here we attempt a minimal parse
  const destHost = params.get('target') || params.get('host') || req.headers['x-dest-host'] || null;
  const destPort = parseInt(params.get('port') || '443', 10);
  const destIsTls = destPort === 443;
  const destIsHttp = destPort === 80 || destPort === 8080 || params.get('http') === '1';

  if (!destHost) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\nMissing destination host');
    return;
  }

  const dest = { host: destHost, port: destPort, isTls: destIsTls, isHttp: destIsHttp };
  const opts = { fakeHeaders, sni: sniParam };

  if (transport === 'httpupgrade') {
    // Respond with 101 and then bind socket
    const upgradeHeader = req.headers['upgrade'] || 'tcp';
    socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
                 'Connection: Upgrade\r\n' +
                 `Upgrade: ${upgradeHeader}\r\n\r\n`);

    // After writing the response, socket is a duplex stream — hand to handler
    handleHttpUpgradeTransport(socket, dest, opts);
  } else {
    // Fallback to WebSocket handling; integration depends on ws server
    // If using 'ws' package you would upgrade to a WebSocket and then pass the stream
    // For a minimal approach, if `socket` is already a stream, forward bytes
    handleWebSocketTransport(socket, dest, opts);
  }
}

module.exports = { handleIncomingUpgrade };
