export type StreamServerId = 'server1' | 'server2' | 'server3' | 'server4';

export interface StreamServer {
  id: StreamServerId;
  label: string;
  url: string;
}

/**
 * Server order reflects current provider health (verified live at time of
 * writing). Server 4 (vidsrc.cc) intermittently returns Cloudflare 522 —
 * kept as a last resort for when it recovers.
 */
export function getMovieServers(tmdbId: string | number): StreamServer[] {
  return [
    { id: 'server1', label: 'Server 1 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` },
    { id: 'server2', label: 'Server 2 (AutoEmbed HD)', url: `https://player.autoembed.me/embed/movie/${tmdbId}` },
    { id: 'server3', label: 'Server 3 (VidSrc.sh)', url: `https://vidsrc.sh/embed/movie/${tmdbId}/` },
    { id: 'server4', label: 'Server 4 (VidSrc.cc)', url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}` },
  ];
}

export function getTvServers(
  tmdbId: string | number,
  season: number,
  episode: number
): StreamServer[] {
  return [
    { id: 'server1', label: 'Server 1 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}` },
    { id: 'server2', label: 'Server 2 (AutoEmbed HD)', url: `https://player.autoembed.me/embed/tv/${tmdbId}/${season}/${episode}` },
    { id: 'server3', label: 'Server 3 (VidSrc.sh)', url: `https://vidsrc.sh/embed/tv/${tmdbId}/${season}/${episode}/` },
    { id: 'server4', label: 'Server 4 (VidSrc.cc)', url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}` },
  ];
}
