/**
 * IndexNow submitter (Bing, Yandex, Seznam, Naver).
 *
 * Usage: npm run indexnow
 * Requires the key file at client/public/<KEY>.txt to be deployed first.
 */

const HOST = "www.movieversepro.xyz";
const KEY = "1b5de3b65c164a5a8f2c604c57e266e3";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const SITEMAPS = [
  `https://${HOST}/sitemap.xml`,
  `https://${HOST}/trending/sitemap.xml`,
  `https://${HOST}/tv/sitemap.xml`,
  `https://${HOST}/top-imdb/sitemap.xml`,
  `https://${HOST}/movie/sitemap.xml`,
];

async function collect() {
  const urls = new Set();
  for (const sitemap of SITEMAPS) {
    try {
      const res = await fetch(sitemap);
      if (!res.ok) {
        console.warn(`skip ${sitemap} (${res.status})`);
        continue;
      }
      const xml = await res.text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1]);
    } catch (err) {
      console.warn(`skip ${sitemap} (${err.message})`);
    }
  }
  return [...urls].slice(0, 10000);
}

const urlList = await collect();
if (!urlList.length) {
  console.error("No URLs found in sitemaps.");
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${res.status} ${res.statusText}`);
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}
