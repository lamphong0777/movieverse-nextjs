import { convertToWebP } from '@/lib/image'
import { Movie } from '@/types'
import Image from 'next/image'
import React from 'react'

interface MovieCardProps {
  movie: Movie
}

const formatType = (type: string): string => {
  switch (type) {
    case 'single':
      return 'Phim Lẻ'
    case 'series':
      return 'Phim Bộ'
    case 'tvshows':
      return 'Chương Trình TV'
    case 'hoathinh':
      return 'Hoạt Hình'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:border-gray-700 hover:shadow-xl">
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={convertToWebP(movie.thumb_url)}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          placeholder="empty"
        />

        {/* Gradient overlay (hover) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Type badge */}
        <div className="absolute top-2 left-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
          {formatType(movie.type)}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        <div className="relative">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-100 transition-colors duration-200 group-hover:text-white">
            {movie.name}
          </h3>

          {/* Tooltip - hiện khi hover, dùng cho tên phim dài */}
          <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-max max-w-[240px] -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {movie.name}
          </div>
        </div>

        <p className="mt-1 text-xs text-gray-400">{movie.year}</p>
      </div>
    </div>
  )
}

export default MovieCard
