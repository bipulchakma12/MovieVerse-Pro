'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Subtitles,
  Settings, Loader2, AlertCircle, RefreshCw, Film, Sparkles, Tv, ExternalLink
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onProgressUpdate?: (seconds: number, total: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  onProgressUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [quality, setQuality] = useState('Auto (1080p)');

  // Determine if URL is an iframe embed vs direct video stream (MP4/HLS)
  const isEmbed = src && (
    src.includes('youtube.com') ||
    src.includes('youtu.be') ||
    src.includes('vidsrc') ||
    src.includes('autoembed') ||
    src.includes('2embed') ||
    src.includes('smashy') ||
    src.includes('embed.su') ||
    src.includes('multiembed') ||
    (!src.endsWith('.mp4') && !src.endsWith('.webm') && !src.endsWith('.m3u8') && !src.includes('gtv-videos-bucket'))
  );

  const embedUrl = isEmbed
    ? src.includes('youtube.com') && !src.includes('embed')
      ? `https://www.youtube.com/embed/${src.split('v=')[1]?.split('&')[0]}?autoplay=1&rel=0`
      : src
    : src;

  // Reset error states when source changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(false);
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.warn('Playback request interrupted:', err);
          setHasError(true);
          setErrorMessage('Playback block or media source unavailable.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);

      if (onProgressUpdate) {
        onProgressUpdate(current, total);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekPercentage = parseFloat(e.target.value);
    if (videoRef.current && duration) {
      const seekTime = (seekPercentage / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setProgress(seekPercentage);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => console.error('Fullscreen error:', err));
      } else {
        document.exitFullscreen().catch((err) => console.error('Exit fullscreen error:', err));
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If source is an iframe embed, render responsive embed container without blocking loading overlays
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800/80 group"
      >
        <iframe
          src={embedUrl}
          title={title || 'MovieVerse Stream Player'}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen *; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write; display-capture"
          allowFullScreen={true}
          // @ts-ignore
          webkitallowfullscreen="true"
          // @ts-ignore
          mozallowfullscreen="true"
          referrerPolicy="no-referrer"
        />
      </div>
    );

  // Native HTML5 Video Stream Player (Supports HTTP 206 Partial Content Range Requests)
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 group shadow-2xl border border-slate-800 select-none"
    >
      <video
        ref={videoRef}
        src={src || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          setErrorMessage('Unable to load video stream. Verify source media URL or CORS configuration.');
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none z-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <span className="text-xs text-slate-300 font-medium mt-2">Buffering stream...</span>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h4 className="text-sm font-bold text-white">Stream Playback Interrupted</h4>
          <p className="text-xs text-slate-400 max-w-sm">{errorMessage}</p>
          <button
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Stream
          </button>
        </div>
      )}

      {/* Custom Video Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 space-y-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-lg appearance-none bg-slate-700/60 accent-brand-500 cursor-pointer focus:outline-none"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="p-1 hover:text-brand-400 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button onClick={toggleMute} className="p-1 hover:text-brand-400 transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-[11px] text-slate-300 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`p-1 transition-colors ${showSubtitles ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Subtitles"
            >
              <Subtitles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setQuality(quality === '1080p' ? '720p' : '1080p')}
              className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white"
            >
              {quality}
            </button>
            <button onClick={toggleFullscreen} className="p-1 hover:text-brand-400 transition-colors">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
