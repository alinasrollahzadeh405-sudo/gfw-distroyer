// src/proxy/tcp.js
// Create TCP or TLS connections and allow overriding servername (SNI) for TLS.
const net = require('net');
const tls = require('tls');

function createTcpConnection(host, port, opts = {}) {
  const useTls = !!opts.tls || port === 443;
  if (!useTls) {
    return net.connect(port, host);
  }

  const tlsOptions = {
    host,
    port,
    servername: opts.sni || host,
    // keep default ALPN/ciphers; could add opts.alpn
  };

  return tls.connect(tlsOptions);
}

module.exports = { createTcpConnection };
