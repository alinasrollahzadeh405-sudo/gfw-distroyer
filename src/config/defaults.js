// src/config/defaults.js
// Default configuration for gfw-distroyer enhancements: ftls, httpupgrade, fake headers
module.exports = {
  // feature toggles
  ENABLE_FTLS: true,
  ENABLE_HTTPUPGRADE: true,
  ALLOW_FAKE_HEADERS: true,

  // defaults
  DEFAULT_FAKE_SNI: '', // e.g. 'www.example.com' — if empty falls back to destination host
  DEFAULT_FAKE_HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Accept': '*/*'
  }
};
