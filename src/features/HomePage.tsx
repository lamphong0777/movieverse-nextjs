'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import FeaturedMovieSlider from '@/components/FeaturedMovieSlider'
import Loading from '@/components/Loading'
import MovieCard from '@/components/MovieCard'

import { fetchLatestMovies } from '@/redux/features/movieSlice'
import { useAppDispatch } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import { Movie } from '@/types'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const { latestMovies, loading, error } = useSelector((state: RootState) => state.movie)

  useEffect(() => {
    dispatch(fetchLatestMovies(1))
  }, [dispatch])

  /* =======================
      DATA PREPARE
  ======================== */
  const featuredMovies = latestMovies.filter((m) => m.tmdb.vote_average >= 8).slice(0, 10)

  const singleMovies = latestMovies.filter((m) => m.type === 'single').slice(0, 6)

  const seriesMovies = latestMovies
    .filter((m) => ['series', 'tvshows', 'hoathinh'].includes(m.type))
    .slice(0, 6)

  /* =======================
      RENDER
  ======================== */
  if (loading) return <Loading />
  if (error) return <div className="text-center text-red-500">Lỗi: {error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* ===== Phim Nổi Bật ===== */}
      <section>
        <h2 className="text-sm font-bold mb-4 border-l-4 border-red-500 pl-3">Phim Nổi Bật</h2>

        {featuredMovies.length === 0 ? (
          <div className="text-center">Không có phim nổi bật.</div>
        ) : (
          <FeaturedMovieSlider movies={featuredMovies} />
        )}
      </section>

      {/* ===== Phim Mới Cập Nhật ===== */}
      <section>
        <h2 className="text-sm font-bold mb-4 border-l-4 border-red-500 pl-3">Phim Mới Cập Nhật</h2>

        <MovieGrid movies={latestMovies.slice(0, 6)} />
      </section>

      {/* ===== Phim Lẻ Đề Cử ===== */}
      <section>
        <h2 className="text-sm font-bold mb-4 border-l-4 border-red-500 pl-3">Phim Lẻ Đề Cử</h2>

        <MovieGrid movies={singleMovies} />
      </section>

      {/* ===== Phim Bộ Đáng Chú Ý ===== */}
      <section>
        <h2 className="text-sm font-bold mb-4 border-l-4 border-red-500 pl-3">
          Phim Bộ Đáng Chú Ý
        </h2>

        <MovieGrid movies={seriesMovies} />
      </section>
    </div>
  )
}

/* =======================
    SUB COMPONENT
======================== */
function MovieGrid({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) {
    return <div className="text-center">Không có phim.</div>
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <Link key={movie._id} href={`/phim/${movie.slug}`}>
          <MovieCard
            movie={{
              ...movie,
              thumb_url: movie.thumb_url?.startsWith('http')
                ? movie.thumb_url
                : `https://phimimg.com/${movie.thumb_url}`,
            }}
          />
        </Link>
      ))}
    </div>
  )
}
