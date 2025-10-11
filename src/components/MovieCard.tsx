import React from 'react';
import Image from 'next/image';
import { Movie } from '@/types';
import { convertToWebP } from '@/lib/image';

interface MovieCardProps {
  movie: Movie;
}

// Hàm để định dạng type cho hiển thị
const formatType = (type: string): string => {
  switch (type) {
    case 'single':
      return 'Phim Lẻ';
    case 'series':
      return 'Phim Bộ';
    case 'tvshows':
      return 'Chương Trình TV';
    case 'hoathinh':
      return 'Hoạt Hình';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => (
  <div className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer aspect-[2/3]">
    <Image
      src={convertToWebP(movie.thumb_url)}
      alt={movie.name}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-110"
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
      priority={movie.tmdb.vote_average >= 8}
    />
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-90 transition-opacity duration-300">
      <h3 className="text-white text-lg font-bold">{movie.name}</h3>
      <p className="text-gray-300 text-sm">{movie.year}</p>
    </div>
    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">{formatType(movie.type)}</div>
  </div>
);

export default MovieCard;
