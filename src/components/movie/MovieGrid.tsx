import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';
import Link from 'next/link';

interface MovieGridProps {
  movies: Movie[];
}

export default function MovieGrid({ movies }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center text-gray-400">
        Không tìm thấy phim nào
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
  );
}
