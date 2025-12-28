'use client';
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/solid';

interface MovieVideoPlayerProps {
  src: string;
  poster?: string;
}

export default function MovieVideoPlayer({ src, poster }: MovieVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.volume = volume;
    video.muted = isMuted;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const resetHideControls = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleMouseMove = () => resetHideControls();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        playPause();
      } else if (e.code === 'ArrowRight') {
        seekForward();
      } else if (e.code === 'ArrowLeft') {
        seekBackward();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const playPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    resetHideControls();
  };

  const seekForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
    resetHideControls();
  };

  const seekBackward = () => {
    if (videoRef.current) videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    resetHideControls();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
    resetHideControls();
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      if (vol > 0 && isMuted) videoRef.current.muted = false;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
    resetHideControls();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    const elem = containerRef.current as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } else {
      const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
    resetHideControls();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    resetHideControls();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onMouseMove={handleMouseMove}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain select-none"
        playsInline
        controls={false}
        onDoubleClick={toggleFullscreen}
      />

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Lớp overlay trong suốt chặn double click ở khu vực controls */}
      {showControls && <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-auto" />}

      {showControls && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-1 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-gray-600 rounded-full cursor-pointer progress-bar-red"
            style={{
              background: `linear-gradient(to right, #ff0000 0%, #ff0000 ${(currentTime / duration || 0) * 100}%, #666 ${
                (currentTime / duration || 0) * 100
              }%, #666 100%)`,
            }}
          />

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button onClick={seekBackward} className="p-2 hover:scale-110 transition">
                <ArrowLeftIcon className="w-4 h-4" />
              </button>

              <button onClick={playPause} className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition">
                {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>

              <button onClick={seekForward} className="p-2 hover:scale-110 transition">
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <button onClick={toggleMute} className="p-2">
                {isMuted || volume === 0 ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={changeVolume}
                className="w-20 h-1 bg-gray-600 rounded accent-white"
              />
            </div>

            <div className="font-mono text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <button onClick={toggleFullscreen} className="p-2 hover:scale-110 transition">
              {isFullscreen ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .progress-bar-red::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        }
        .progress-bar-red::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
