'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchLatestMovies } from '@/redux/features/movieSlice';
import { RootState } from '@/redux/store';
import { Movie } from '@/types';
import Slider from 'react-slick';
import Image from 'next/image';
import MovieCard from '@/components/MovieCard';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { useAppDispatch } from '@/redux/hooks';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { latestMovies, loading, error } = useSelector((state: RootState) => state.movie);

  useEffect(() => {
    dispatch(fetchLatestMovies(1)); // Fetch trang đầu tiên
  }, [dispatch]);

  // Filter phim nổi bật (vote_average >= 8)
  const featuredMovies = latestMovies.filter((movie: Movie) => movie.tmdb.vote_average >= 8).slice(0, 5);

  // Filter phim lẻ (type: "single") cho Phim Lẻ Đề Cử
  const singleMovies = latestMovies.filter((movie: Movie) => movie.type === 'single').slice(0, 6);

  // Filter phim bộ (type: "series", "tvshows", "hoathinh") cho Phim Bộ Đáng Chú Ý
  const seriesMovies = latestMovies.filter((movie: Movie) => ['series', 'tvshows', 'hoathinh'].includes(movie.type)).slice(0, 6);

  // Cài đặt cho slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
    dotsClass: 'slick-dots slick-dots-larger',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Phần Hero Banner - Phim nổi bật */}
      <section className="mb-12">
        {loading && <Loading />}
        {error && <div className="text-center text-red-500">Lỗi: {error}</div>}
        {!loading && !error && featuredMovies.length === 0 && <div className="text-center">Không có phim nổi bật nào được tìm thấy.</div>}
        {!loading && !error && featuredMovies.length > 0 && (
          <Slider {...sliderSettings}>
            {featuredMovies.map((movie: Movie) => (
              <div key={movie._id} className="relative rounded-lg overflow-hidden h-[700px]">
                <Image
                  src={movie.poster_url?.startsWith('http') ? movie.poster_url : `https://phimimg.com/${movie.poster_url}`}
                  alt={movie.name}
                  fill
                  className="object-cover w-full h-full"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10">
                  <h1 className="text-5xl font-bold mb-3">{movie.name}</h1>
                  <p className="text-gray-300 text-lg max-w-2xl mb-6">
                    {movie.category.map((cat) => cat.name).join(', ')} • {movie.year} • {movie.lang}
                  </p>
                  <Link href={`/phim/${movie.slug}`}>
                    <button className="cursor-pointer bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 text-lg">
                      ▶️ Xem Ngay
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </section>

      {/* Phần Phim Mới Cập Nhật */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-4">Phim Mới Cập Nhật</h2>
        {loading && <Loading />}
        {error && <div className="text-center text-red-500">Lỗi: {error}</div>}
        {!loading && !error && latestMovies.length === 0 && <div className="text-center">Không có phim nào được tìm thấy.</div>}
        {!loading && !error && latestMovies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestMovies.slice(0, 6).map((movie: Movie) => (
              <Link key={movie._id} href={`/phim/${movie.slug}`}>
                <MovieCard
                  key={movie._id}
                  movie={{
                    ...movie,
                    thumb_url: movie.thumb_url?.startsWith?.('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`,
                    type: movie.type === 'series' ? 'series' : movie.type === 'single' ? 'single' : movie.type,
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Phần Phim Lẻ Đề Cử */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-4">Phim Lẻ Đề Cử</h2>
        {loading && <Loading />}
        {error && <div className="text-center text-red-500">Lỗi: {error}</div>}
        {!loading && !error && singleMovies.length === 0 && <div className="text-center">Không có phim lẻ nào được tìm thấy.</div>}
        {!loading && !error && singleMovies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {singleMovies.map((movie: Movie) => (
              <Link key={movie._id} href={`/phim/${movie.slug}`}>
                <MovieCard
                  key={movie._id}
                  movie={{
                    ...movie,
                    thumb_url: movie.thumb_url?.startsWith?.('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`,
                    type: movie.type === 'series' ? 'series' : movie.type === 'single' ? 'single' : movie.type,
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Phần Phim Bộ Đáng Chú Ý */}
      <section>
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-4">Phim Bộ Đáng Chú Ý</h2>
        {loading && <Loading />}
        {error && <div className="text-center text-red-500">Lỗi: {error}</div>}
        {!loading && !error && seriesMovies.length === 0 && <div className="text-center">Không có phim bộ nào được tìm thấy.</div>}
        {!loading && !error && seriesMovies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {seriesMovies.map((movie: Movie) => (
              <Link key={movie._id} href={`/phim/${movie.slug}`}>
                <MovieCard
                  key={movie._id}
                  movie={{
                    ...movie,
                    thumb_url: movie.thumb_url?.startsWith?.('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`,
                    type: movie.type === 'series' ? 'series' : movie.type === 'single' ? 'single' : movie.type,
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
