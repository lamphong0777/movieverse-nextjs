'use client';

import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';
import Link from 'next/link';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface FeaturedMovieSliderProps {
  movies: Movie[];
}

export default function FeaturedMovieSlider({ movies }: FeaturedMovieSliderProps) {
  return (
    <div className="w-full relative">
      <style jsx>{`
        .featured-movie-swiper .swiper-button-next,
        .featured-movie-swiper .swiper-button-prev {
          width: 28px !important;
          height: 28px !important;
          background: rgba(0, 0, 0, 0.6) !important;
          border-radius: 50% !important;
          margin-top: -14px !important;
        }
        
        .featured-movie-swiper .swiper-button-next:after,
        .featured-movie-swiper .swiper-button-prev:after {
          font-size: 14px !important;
          color: white !important;
          font-weight: bold !important;
        }
        
        .featured-movie-swiper .swiper-button-next {
          right: 8px !important;
        }
        
        .featured-movie-swiper .swiper-button-prev {
          left: 8px !important;
        }
        
        @media (max-width: 640px) {
          .featured-movie-swiper .swiper-button-next,
          .featured-movie-swiper .swiper-button-prev {
            width: 24px !important;
            height: 24px !important;
            margin-top: -12px !important;
          }
          
          .featured-movie-swiper .swiper-button-next:after,
          .featured-movie-swiper .swiper-button-prev:after {
            font-size: 12px !important;
          }
          
          .featured-movie-swiper .swiper-button-next {
            right: 4px !important;
          }
          
          .featured-movie-swiper .swiper-button-prev {
            left: 4px !important;
          }
        }
      `}</style>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={8}
        slidesPerView={6}
        slidesPerGroup={1}
        navigation
        pagination={false}
        loop={true}
        breakpoints={{
          320: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 4,
          },
          640: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 8,
          },
          768: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            spaceBetween: 8,
          },
          1024: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            spaceBetween: 8,
          },
          1280: {
            slidesPerView: 5,
            slidesPerGroup: 5,
            spaceBetween: 8,
          },
          1536: {
            slidesPerView: 6,
            slidesPerGroup: 6,
            spaceBetween: 8,
          },
        }}
        className="featured-movie-swiper"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie._id}>
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
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
