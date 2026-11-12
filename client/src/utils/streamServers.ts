export type StreamServerId = 'server1' | 'server2' | 'server3' | 'server4';

export interface StreamServer {
  id: StreamServerId;
  label: string;
  url: string;
}

export function getMovieServers(tmdbId: string | number): StreamServer[] {
  return [
    { id: 'server1', label: 'Server 1 (CineSrc Clean)', url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}` },
    { id: 'server2', label: 'Server 2 (AutoEmbed HD)', url: `https://autoembed.co/movie/tmdb/${tmdbId}` },
    { id: 'server3', label: 'Server 3 (VidSrc.to)', url: `https://vidsrc.to/embed/movie/${tmdbId}` },
    { id: 'server4', label: 'Server 4 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` },
  ];
}

export function getTvServers(
  tmdbId: string | number,
  season: number,
  episode: number
): StreamServer[] {
  return [
    { id: 'server1', label: 'Server 1 (VidSrc.cc Clean)', url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}` },
    { id: 'server2', label: 'Server 2 (VidSrc.xyz)', url: `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}` },
    { id: 'server3', label: 'Server 3 (Smashy)', url: `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}` },
    { id: 'server4', label: 'Server 4 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}` },
  ];
}
