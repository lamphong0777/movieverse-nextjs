'use client'

import { MovieVideoPlayerProps } from '@/types'
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/solid'
import Hls from 'hls.js'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function MovieVideoPlayer({ src, poster }: MovieVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const speedOptions = [0.5, 1, 1.25, 1.5, 2]

  const resetHideControls = useCallback(() => {
    setShowControls(true)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
      setShowVolumeSlider(false)
    }, 2500)
  }, [])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return
    if (playing) {
      video.pause()
    } else {
      await video.play()
    }
    resetHideControls()
  }

  const seek = (amount: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + amount)
    resetHideControls()
  }

  const handleVolume = (value: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = value
    videoRef.current.muted = value === 0
    setVolume(value)
    setMuted(value === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Lắng nghe sự kiện fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      resetHideControls()
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [resetHideControls])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
    } else {
      video.src = src
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTime = () => setCurrentTime(video.currentTime)
    const onDuration = () => setDuration(video.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('durationchange', onDuration)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('durationchange', onDuration)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [])

  const formatTime = (t: number) => {
    if (isNaN(t)) return '00:00'
    const hours = Math.floor(t / 3600)
    const minutes = Math.floor((t % 3600) / 60)
    const seconds = Math.floor(t % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = (currentTime / (duration || 1)) * 100
  const volumePercent = volume * 100

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}
      onMouseMove={resetHideControls}
      onMouseLeave={() => {
        setShowControls(false)
        setShowVolumeSlider(false)
      }}
    >
      {/* Container cho video - căn giữa khi fullscreen */}
      <div className={`w-full h-full ${isFullscreen ? 'flex items-center justify-center' : ''}`}>
        <video
          ref={videoRef}
          poster={poster}
          className={`${
            isFullscreen ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'
          } cursor-pointer`}
          onClick={togglePlay}
          playsInline
        />
      </div>

      {/* Overlay trong suốt để bắt sự kiện khi fullscreen */}
      {isFullscreen && <div className="absolute inset-0 z-5" onMouseMove={resetHideControls} />}

      {/* Center play button khi pause */}
      {!playing && showControls && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 border-2 border-white/50"
          >
            <PlayIcon className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-12 pb-4 px-4 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div className="relative group/progress mb-3">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) videoRef.current.currentTime = Number(e.target.value)
            }}
            className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-lg" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg">
              {playing ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>

            {/* Skip backward */}
            <button onClick={() => seek(-10)} className="p-2 hover:bg-white/10 rounded-lg">
              <BackwardIcon className="w-5 h-5" />
            </button>

            {/* Skip forward */}
            <button onClick={() => seek(10)} className="p-2 hover:bg-white/10 rounded-lg">
              <ForwardIcon className="w-5 h-5" />
            </button>

            {/* Volume - SỬA LẠI PHẦN NÀY */}
            <div className="relative flex items-center">
              <button
                onClick={toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                {muted || volume === 0 ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>

              {/* Volume slider - xuất hiện bên phải nhưng không đè lên time */}
              {showVolumeSlider && (
                <div
                  className="absolute left-full ml-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => handleVolume(Number(e.target.value))}
                    className="w-20 h-1 appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right,
                        #ef4444 0%,
                        #ef4444 ${volumePercent}%,
                        #4b5563 ${volumePercent}%,
                        #4b5563 100%)`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Time - thêm margin left để tránh bị đè */}
            <span className="text-sm font-medium ml-4">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed selector */}
            <div className="relative group/speed">
              <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium">
                {playbackRate}x
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-16 bg-gray-900 rounded-lg overflow-hidden opacity-0 group-hover/speed:opacity-100 pointer-events-none group-hover/speed:pointer-events-auto">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (videoRef.current) videoRef.current.playbackRate = s
                      setPlaybackRate(s)
                    }}
                    className={`w-full px-3 py-2 text-sm hover:bg-white/10 ${
                      playbackRate === s ? 'text-red-500 font-medium' : 'text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen button */}
            <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg">
              {isFullscreen ? (
                <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
