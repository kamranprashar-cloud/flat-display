// FT headlines relay for the flat wall display.
// Paste this whole file into a Cloudflare Worker and deploy it.
// It reads the FT's public headline feed and hands the titles to the display
// in a form a web page is allowed to read. Nothing is stored.

const FEEDS = [
  'https://www.ft.com/rss/home/uk',
  'https://www.ft.com/rss/home',
  'https://www.ft.com/news-feed?format=rss'
];
const MAX_HEADLINES = 12;
const CACHE_SECONDS = 600;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parse(xml) {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  const out = [];
  for (const item of items) {
    const m = item.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (!m) continue;
    const title = decode(m[1]);
    if (title && !out.includes(title)) out.push(title);
    if (out.length >= MAX_HEADLINES) break;
  }
  return out;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    for (const url of FEEDS) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (flat wall display)' },
          cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
        });
        if (!res.ok) continue;
        const headlines = parse(await res.text());
        if (headlines.length) {
          return new Response(JSON.stringify({ source: url, updated: new Date().toISOString(), headlines }), {
            headers: { ...CORS, 'Cache-Control': 'public, max-age=' + CACHE_SECONDS }
          });
        }
      } catch (e) {
        // try the next feed
      }
    }
    return new Response(JSON.stringify({ error: 'No FT feed could be read', headlines: [] }), { status: 502, headers: CORS });
  }
};
