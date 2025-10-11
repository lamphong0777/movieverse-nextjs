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
  const [volume, setVolume] = useState(1); // 0..1
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // HLS setup
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Time & play/pause updates
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

  // Keyboard controls
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

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

    const elem: HTMLElement & { webkitRequestFullscreen?: () => Promise<void> } = containerRef.current;

    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      const doc: Document & { webkitExitFullscreen?: () => Promise<void> } = document;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
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
    videoRef.current.currentTime = parseFloat(e.target.value);
    setCurrentTime(parseFloat(e.target.value));
    resetHideControls();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'fixed top-0 left-0 w-screen h-screen z-50 bg-black' : ''}`}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onDoubleClick={toggleFullscreen}
    >
      <video ref={videoRef} poster={poster} className="w-full h-auto rounded-lg bg-black select-none" playsInline controls={false} tabIndex={-1} />

      {showControls && (
        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between bg-opacity-40 rounded p-1 gap-2 text-xs">
          {/* Left time */}
          <div className="text-white font-mono w-16 text-left">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Center buttons + progress + volume */}
          <div className="flex flex-col items-center flex-1 gap-0.5">
            <div className="flex gap-1 items-center">
              <button onClick={seekBackward} className="p-1 bg-gray-700 bg-opacity-60 rounded-full hover:bg-opacity-80" title="Tua lùi 10s">
                <ArrowLeftIcon className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={playPause}
                className="p-1 bg-gray-700 bg-opacity-60 rounded-full hover:bg-opacity-80"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon className="w-4 h-4 text-white" /> : <PlayIcon className="w-4 h-4 text-white" />}
              </button>
              <button onClick={seekForward} className="p-1 bg-gray-700 bg-opacity-60 rounded-full hover:bg-opacity-80" title="Tua tới 10s">
                <ArrowRightIcon className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={toggleMute}
                className="p-1 bg-gray-700 bg-opacity-60 rounded-full hover:bg-opacity-80"
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted || volume === 0 ? <SpeakerXMarkIcon className="w-4 h-4 text-white" /> : <SpeakerWaveIcon className="w-4 h-4 text-white" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={changeVolume}
                className="w-16 h-1 rounded-lg accent-blue-400 cursor-pointer"
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 rounded-lg accent-blue-400 cursor-pointer"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1 bg-gray-700 bg-opacity-60 rounded-full hover:bg-opacity-80"
            title={isFullscreen ? 'Thoát fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <ArrowsPointingInIcon className="w-4 h-4 text-white" /> : <ArrowsPointingOutIcon className="w-4 h-4 text-white" />}
          </button>
        </div>
      )}
    </div>
  );
}
