'use client'

import MovieVideoPlayer from '@/components/MovieVideoPlayer'
import { convertToWebP } from '@/lib/image'
import { fetchMovieDetails } from '@/redux/features/movieSlice'
import { useAppDispatch } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import { Episode, Server } from '@/types'
import Head from 'next/head'
import Image from 'next/image'
import { use, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

export default function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const dispatch = useAppDispatch()

  const { movieDetails, loading, error } = useSelector((state: RootState) => state.movie)

  const [openServers, setOpenServers] = useState<Record<string, boolean>>({})
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)

  useEffect(() => {
    if (slug) dispatch(fetchMovieDetails(slug))
  }, [dispatch, slug])

  const toggleServer = (serverKey: string) => {
    setOpenServers((prev) => ({ ...prev, [serverKey]: !prev[serverKey] }))
  }

  const handleEpisodeSelect = (server: Server, episode: Episode) => {
    setSelectedServer(server)
    setSelectedEpisode(episode)
  }

  const movie = movieDetails?.movie

  const videoId = useMemo(() => {
    if (!movie?.trailer_url) return null
    try {
      const url = new URL(movie.trailer_url)
      return new URLSearchParams(url.search).get('v')
    } catch {
      return null
    }
  }, [movie?.trailer_url])

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center text-lg">
          Đang tải dữ liệu phim...
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <div className="text-red-500 text-lg">Lỗi: {error}</div>
          <button
            onClick={() => dispatch(fetchMovieDetails(slug))}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )

  if (!movie)
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center text-lg">Không tìm thấy phim</div>
      </div>
    )

  const countries =
    movie.country?.map((c: unknown) => (c as { name: string }).name).join(', ') || 'Không xác định'
  const categories =
    movie.category?.map((c: unknown) => (c as { name: string }).name).join(', ') || 'Không xác định'

  return (
    <>
      <Head>
        <title>{movie.name} | Xem Phim</title>
        <meta name="description" content={movie.content || 'Xem phim chất lượng cao'} />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <div className="border border-gray-800 bg-gray-950">
              <div className="relative aspect-[2/3] w-full overflow-hidden">
                <Image
                  src={convertToWebP(movie.poster_url)}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-4 border-t border-gray-800 space-y-2">
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Tên gốc:</span>{' '}
                  {movie.origin_name || 'Không xác định'}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Năm:</span> {movie.year || 'Không xác định'}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Thời lượng:</span>{' '}
                  {movie.time || 'Không xác định'}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Chất lượng:</span>{' '}
                  {movie.quality || 'Không xác định'}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Ngôn ngữ:</span> {movie.lang || 'Không xác định'}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Trạng thái:</span>{' '}
                  {movie.episode_current || 'Không xác định'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-800 bg-gray-950">
                <div className="p-4 md:p-5 border-b border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">{movie.name}</h1>

                    {selectedEpisode && selectedServer ? (
                      <div className="text-sm text-gray-300">
                        <span className="text-gray-500">Đang xem:</span>{' '}
                        <span className="text-white">{selectedEpisode.name}</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-white">{selectedServer.server_name}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-4 md:p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="text-gray-300">
                      <span className="text-gray-500">Quốc gia:</span> {countries}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Thể loại:</span> {categories}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Diễn viên:</span>{' '}
                      {movie.actor?.join(', ') || 'Không xác định'}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Đạo diễn:</span>{' '}
                      {movie.director?.join(', ') || 'Không xác định'}
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-4 text-sm text-gray-300 leading-relaxed">
                    {movie.content || 'Không có mô tả'}
                  </div>
                </div>
              </div>

              <div className="border border-gray-800 bg-black">
                {selectedEpisode ? (
                  <MovieVideoPlayer
                    key={selectedEpisode.link_m3u8}
                    src={selectedEpisode.link_m3u8}
                    poster={movie.thumb_url}
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center text-gray-400 text-sm">
                    Chọn tập phim để xem
                  </div>
                )}
              </div>

              <div className="border border-gray-800 bg-gray-950">
                <div className="px-4 md:px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold">Danh sách tập</h2>
                  {selectedEpisode ? (
                    <div className="text-xs text-gray-400">Chọn tập để xem ngay</div>
                  ) : null}
                </div>

                <div className="p-4 md:p-5">
                  {movieDetails.episodes && movieDetails.episodes.length > 0 ? (
                    <div className="space-y-4">
                      {(movieDetails.episodes as Server[]).map((server: Server, index) => {
                        const serverKey = `${server.server_name}-${index}`
                        const defaultOpen =
                          index === 0 ||
                          !String(server.server_name || '')
                            .toLowerCase()
                            .includes('vip')
                        const isOpen = openServers[serverKey] ?? defaultOpen

                        return (
                          <div key={serverKey} className="border border-gray-800">
                            <button
                              onClick={() => toggleServer(serverKey)}
                              className="w-full px-4 py-3 flex items-center justify-between bg-gray-900 hover:bg-gray-800 border-b border-gray-800"
                            >
                              <div className="text-sm md:text-base font-medium text-left">
                                {server.server_name}
                              </div>
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>

                            {isOpen ? (
                              <div className="p-3 bg-gray-950">
                                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-1">
                                  {(server.server_data || []).map((episode: Episode) => {
                                    const active =
                                      selectedEpisode?.slug === episode.slug &&
                                      selectedServer?.server_name === server.server_name

                                    return (
                                      <button
                                        key={episode.slug}
                                        onClick={() => handleEpisodeSelect(server, episode)}
                                        className={`px-2 py-1 text-xs md:text-sm border border-gray-800 ${
                                          active
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-900 hover:bg-gray-800 text-gray-200'
                                        }`}
                                      >
                                        {episode.name}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-300 py-10">
                      Không có tập phim nào được tìm thấy
                    </div>
                  )}
                </div>
              </div>

              {videoId ? (
                <div className="border border-gray-800 bg-gray-950">
                  <div className="px-4 md:px-5 py-3 border-b border-gray-800">
                    <h2 className="text-lg md:text-xl font-semibold">Trailer</h2>
                  </div>
                  <div className="bg-black">
                    <iframe
                      className="w-full h-64 md:h-96"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
