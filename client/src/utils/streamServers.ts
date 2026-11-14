export type StreamServerId = 'server1' | 'server2' | 'server3' | 'server4';

export interface StreamServer {
  id: StreamServerId;
  label: string;
  url: string;
}

/**
 * Server order reflects current provider health/ad behavior (verified live at time of
 * writing). vidlink.pro is the lightest-ad provider observed (analytics only, no
 * popunder/redirect code found in its HTML). multiembed/autoembed/vidsrc.sh ship
 * popup-ad and tracker code — kept as fallbacks. vidsrc.cc intermittently 522s.
 */
export function getMovieServers(tmdbId: string | number): StreamServer[] {
  return [
    { id: 'server1', label: 'Server 1 (VidLink)', url: `https://vidlink.pro/movie/${tmdbId}` },
    { id: 'server2', label: 'Server 2 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` },
    { id: 'server3', label: 'Server 3 (AutoEmbed HD)', url: `https://player.autoembed.me/embed/movie/${tmdbId}` },
    { id: 'server4', label: 'Server 4 (VidSrc.sh)', url: `https://vidsrc.sh/embed/movie/${tmdbId}/` },
  ];
}

export function getTvServers(
  tmdbId: string | number,
  season: number,
  episode: number
): StreamServer[] {
  return [
    { id: 'server1', label: 'Server 1 (VidLink)', url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}` },
    { id: 'server2', label: 'Server 2 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}` },
    { id: 'server3', label: 'Server 3 (AutoEmbed HD)', url: `https://player.autoembed.me/embed/tv/${tmdbId}/${season}/${episode}` },
    { id: 'server4', label: 'Server 4 (VidSrc.sh)', url: `https://vidsrc.sh/embed/tv/${tmdbId}/${season}/${episode}/` },
  ];
}
