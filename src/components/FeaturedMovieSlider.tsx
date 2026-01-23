'use client';

import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';
import Link from 'next/link';
import Slider from 'react-slick';

interface FeaturedMovieSliderProps {
  movies: Movie[];
}

export default function FeaturedMovieSlider({ movies }: FeaturedMovieSliderProps) {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
    ],
  };

  return (
    <Slider {...sliderSettings}>
      {movies.map((movie) => (
        <div key={movie._id} className="px-2">
          <div className="scale-105 sm:scale-100">
            <Link href={`/phim/${movie.slug}`}>
              <MovieCard
                movie={{
                  ...movie,
                  thumb_url: movie.thumb_url?.startsWith('http')
                    ? movie.thumb_url
                    : `https://phimimg.com/${movie.thumb_url}`,
                }}
              />
            </Link>
          </div>
        </div>
      ))}
    </Slider>
  );
}
