// src/proxy/transport-handlers.js
// Transport handlers: websocket (existing) and httpupgrade (new)
const { createTcpConnection } = require('./tcp');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pump = promisify(pipeline);

function streamPipe(a, b) {
  // a and b are stream-like (Node streams). Use pipeline to handle errors and close.
  pump(a, b).catch(() => { try { a.destroy(); } catch(e){} try{ b.destroy(); }catch(e){} });
}

async function handleWebSocketTransport(ws, dest, opts = {}) {
  // ws: a WebSocket or a duplex stream representing client
  // dest: { host, port, isTls, isHttp }
  const remote = createTcpConnection(dest.host, dest.port, { tls: dest.isTls, sni: opts.sni });

  // If fake headers requested and destination expects HTTP, write initial request
  if (opts.fakeHeaders && dest.isHttp) {
    const headerBlock = Object.entries(opts.fakeHeaders).map(([k, v]) => `${k}: ${v}`).join('\r\n');
    const initialReq = `GET / HTTP/1.1\r\nHost: ${dest.host}\r\n${headerBlock}\r\n\r\n`;
    remote.write(initialReq);
  }

  // pipe bi-directionally
  streamPipe(ws, remote);
  streamPipe(remote, ws);
}

async function handleHttpUpgradeTransport(clientSocket, dest, opts = {}) {
  // clientSocket: Duplex stream after HTTP 101 Switching Protocols
  // dest: { host, port, isTls, isHttp }
  const remote = createTcpConnection(dest.host, dest.port, { tls: dest.isTls, sni: opts.sni });

  // If fake headers requested and destination is HTTP, send header block to hide traffic
  if (opts.fakeHeaders && dest.isHttp) {
    const headerBlock = Object.entries(opts.fakeHeaders).map(([k, v]) => `${k}: ${v}`).join('\r\n');
    const initialReq = `GET / HTTP/1.1\r\nHost: ${dest.host}\r\n${headerBlock}\r\n\r\n`;
    remote.write(initialReq);
  }

  // Pipe both directions
  streamPipe(clientSocket, remote);
  streamPipe(remote, clientSocket);
}

module.exports = { handleWebSocketTransport, handleHttpUpgradeTransport };
