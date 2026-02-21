'use client'

import { MovieVideoPlayerProps } from '@/types'

import {
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

  const speedOptions = [0.5, 1, 1.25, 1.5, 2]

  const resetHideControls = useCallback(() => {
    setShowControls(true)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
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
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

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
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = (currentTime / (duration || 1)) * 100
  const volumePercent = volume * 100

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black group"
      onMouseMove={resetHideControls}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
      />

      <div
        className={`absolute bottom-0 left-0 right-0 px-4 pb-3 pt-10
      bg-gradient-to-t from-black/90 via-black/60 to-transparent
      transition-opacity duration-300
      ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            if (videoRef.current) videoRef.current.currentTime = Number(e.target.value)
          }}
          className="w-full h-1 appearance-none cursor-pointer mb-3"
          style={{
            background: `linear-gradient(to right,
            #ff0000 0%,
            #ff0000 ${(currentTime / (duration || 1)) * 100}%,
            rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%,
            rgba(255,255,255,0.3) 100%)`,
          }}
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="hover:text-red-500 transition">
              {playing ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>

            <button onClick={() => seek(-10)} className="hover:text-red-500 transition">
              <BackwardIcon className="w-5 h-5" />
            </button>

            <button onClick={() => seek(10)} className="hover:text-red-500 transition">
              <ForwardIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-red-500 transition">
                {muted ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>

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
                  #ffffff 0%,
                  #ffffff ${volume * 100}%,
                  rgba(255,255,255,0.3) ${volume * 100}%,
                  rgba(255,255,255,0.3) 100%)`,
                }}
              />
            </div>

            <span className="text-xs opacity-80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = Number(e.target.value)
                if (videoRef.current) videoRef.current.playbackRate = rate
                setPlaybackRate(rate)
              }}
              className="bg-transparent text-white text-sm outline-none hover:text-red-500"
            >
              {speedOptions.map((s) => (
                <option key={s} value={s} className="text-black">
                  {s}x
                </option>
              ))}
            </select>

            <button onClick={toggleFullscreen} className="hover:text-red-500 transition">
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
