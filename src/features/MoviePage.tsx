'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchMovieDetails } from '@/redux/features/movieSlice';
import { RootState } from '@/redux/store';
import Image from 'next/image';
import Head from 'next/head';
import Hls from 'hls.js';
import { convertToWebP } from '@/lib/image';
import { useAppDispatch } from '@/redux/hooks';
import { Episode, Server } from '@/types';
import MovieVideoPlayer from '@/components/MovieVideoPlayer';

export default function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const dispatch = useAppDispatch();
  const { movieDetails, loading, error } = useSelector((state: RootState) => state.movie);

  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Gọi API khi slug thay đổi
  useEffect(() => {
    if (slug) dispatch(fetchMovieDetails(slug));
  }, [dispatch, slug]);

  // Khởi tạo HLS player
  useEffect(() => {
    if (selectedEpisode?.link_m3u8 && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(selectedEpisode.link_m3u8);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native support
        video.src = selectedEpisode.link_m3u8;
      }
    }
  }, [selectedEpisode]);

  const handleEpisodeSelect = (server: Server, episode: Episode) => {
    setSelectedServer(server);
    setSelectedEpisode(episode);
  };

  // 🔹 Loading & Error
  if (loading) return <div className="text-center text-white text-xl mt-10">Đang tải dữ liệu phim...</div>;

  if (error)
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        Lỗi: {error}
        <button onClick={() => dispatch(fetchMovieDetails(slug))} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Thử lại
        </button>
      </div>
    );

  if (!movieDetails?.movie) return <div className="text-center text-white text-xl mt-10">Không tìm thấy phim</div>;

  const movie = movieDetails.movie;

  let videoId: string | null = null;

  try {
    if (movie.trailer_url) {
      const url = new URL(movie.trailer_url);
      videoId = new URLSearchParams(url.search).get('v');
    }
  } catch {
    videoId = null;
  }

  return (
    <>
      <Head>
        <title>{movie.name} | Xem Phim</title>
        <meta name="description" content={movie.content || 'Xem phim chất lượng cao'} />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Phim */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-1/3">
              <Image
                src={convertToWebP(movie.poster_url)}
                alt={movie.name}
                width={300}
                height={450}
                className="rounded-lg shadow-lg object-cover"
                priority
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{movie.name}</h1>
              <p className="text-lg mb-2">
                <strong>Tên gốc:</strong> {movie.origin_name || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Năm:</strong> {movie.year || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Quốc gia:</strong> {movie.country?.map((c: unknown) => (c as { name: string }).name).join(', ') || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Thể loại:</strong> {movie.category?.map((c: unknown) => (c as { name: string }).name).join(', ') || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Diễn viên:</strong> {movie.actor?.join(', ') || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Đạo diễn:</strong> {movie.director?.join(', ') || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Thời lượng:</strong> {movie.time || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Chất lượng:</strong> {movie.quality || 'Không xác định'}
              </p>
              <p className="text-lg mb-2">
                <strong>Ngôn ngữ:</strong> {movie.lang || 'Không xác định'}
              </p>
              <p className="text-lg mb-4">
                <strong>Trạng thái:</strong> {movie.episode_current || 'Không xác định'}
              </p>
              <p className="text-base">{movie.content || 'Không có mô tả'}</p>
            </div>
          </div>

          {/* Video Player */}
          {/* {selectedEpisode && selectedServer && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">
                Đang xem: {selectedEpisode.name} ({selectedServer.server_name})
              </h2>
              <video ref={videoRef} controls playsInline className="w-full rounded-lg shadow-lg bg-black" poster={movie.thumb_url}>
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            </div>
          )} */}
          {selectedEpisode && selectedServer && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">
                Đang xem: {selectedEpisode.name} ({selectedServer.server_name})
              </h2>
              <MovieVideoPlayer src={selectedEpisode.link_m3u8} poster={movie.thumb_url} />
            </div>
          )}

          {/* Danh sách tập */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Danh sách tập</h2>
            {movieDetails.episodes && movieDetails.episodes.length > 0 ? (
              movieDetails.episodes.map((server: Server) => (
                <div key={server.server_name} className="mb-6">
                  <h3 className="text-xl font-medium mb-3">{server.server_name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {(server.server_data || []).map((episode: Episode) => (
                      <button
                        key={episode.slug}
                        onClick={() => handleEpisodeSelect(server, episode)}
                        className={`py-2 rounded-lg text-center text-sm transition-all ${
                          selectedEpisode?.slug === episode.slug ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {episode.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-300 text-lg">Không có tập phim nào được tìm thấy</div>
            )}
          </div>

          {/* 🎞️ Trailer */}
          {videoId && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">Trailer</h2>
              <iframe
                className="w-full h-64 md:h-96 rounded-lg"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
