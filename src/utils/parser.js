// src/utils/parser.js
// Helpers to parse sni and fake headers from query parameters or options
function parseFakeHeadersFromQuery(urlSearchParams) {
  // expected format: fakeheaders=Header1:val1;Header2:val2
  const raw = urlSearchParams.get('fakeheaders') || '';
  if (!raw) return {};
  return raw
    .split(';')
    .map(p => p.trim())
    .filter(Boolean)
    .reduce((acc, kv) => {
      const [k, ...rest] = kv.split(':');
      if (!k) return acc;
      acc[k.trim()] = rest.join(':').trim();
      return acc;
    }, {});
}

function parseSNIFromQuery(urlSearchParams) {
  return urlSearchParams.get('sni') || '';
}

module.exports = { parseFakeHeadersFromQuery, parseSNIFromQuery };
