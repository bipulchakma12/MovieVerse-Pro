'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Subtitles, Settings } from 'lucide-react';

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
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [quality, setQuality] = useState('1080p');

  // Check if source is a YouTube embed URL
  const isYouTube = src && (src.includes('youtube.com') || src.includes('youtu.be'));
  const youtubeEmbedUrl = isYouTube
    ? src.includes('embed')
      ? `${src}?autoplay=1&rel=0`
      : `https://www.youtube.com/embed/${src.split('v=')[1]?.split('&')[0]}?autoplay=1&rel=0`
    : src;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => console.log('Autoplay error:', err));
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
        containerRef.current.requestFullscreen().catch((err) => console.error(err));
      } else {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If YouTube URL, render responsive YouTube iframe
  if (isYouTube) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800"
      >
        <iframe
          src={youtubeEmbedUrl}
          title={title || 'Movie Video Player'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group shadow-2xl border border-slate-800"
    >
      <video
        ref={videoRef}
        src={src || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        playsInline
        controls={false}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Big Center Play Button Overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity z-20 pointer-events-auto">
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform border border-brand-400/50"
            aria-label="Play Movie"
          >
            <Play className="w-10 h-10 fill-current ml-1" />
          </button>
        </div>
      )}

      {/* Subtitle Display Simulation */}
      {showSubtitles && (
        <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none px-4 z-10">
          <span className="inline-block px-3 py-1 bg-black/80 text-white text-xs sm:text-sm font-medium rounded-md backdrop-blur-sm">
            [ Subtitle English: "Every choice has a consequence in MovieVerse." ]
          </span>
        </div>
      )}

      {/* Control Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
        
        {/* Top Header */}
        <div className="flex items-center justify-between text-white text-sm font-medium">
          <span>{title || 'Now Playing'}</span>
          <span className="px-2 py-0.5 rounded bg-brand-600 text-xs font-bold">{quality}</span>
        </div>

        {/* Bottom Bar Controls */}
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 accent-brand-500 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="hover:text-brand-500 transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button onClick={toggleMute} className="hover:text-brand-500 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Subtitles toggle */}
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-1 rounded ${showSubtitles ? 'text-brand-500' : 'text-slate-400 hover:text-white'}`}
                title="Subtitles (CC)"
              >
                <Subtitles className="w-5 h-5" />
              </button>

              {/* Quality selector */}
              <div className="relative group/q">
                <button className="flex items-center gap-1 hover:text-brand-500">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="absolute bottom-6 right-0 hidden group-hover/q:block bg-slate-900 border border-slate-700 rounded-lg py-1 px-2 space-y-1 text-xs">
                  {['1080p', '720p', '480p'].map((q) => (
                    <div
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`cursor-pointer px-2 py-1 rounded hover:bg-slate-800 ${quality === q ? 'text-brand-500 font-bold' : ''}`}
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="hover:text-brand-500 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
