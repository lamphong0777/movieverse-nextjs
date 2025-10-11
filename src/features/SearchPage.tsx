'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchMovie } from '@/redux/features/movieSlice';
import { RootState } from '@/redux/store';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import { BreadCrumbItem, Movie } from '@/types';
import { useAppDispatch } from '@/redux/hooks';

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const page = Number(searchParams.get('page') || 1);

  const { searchResults, searchSeoOnPage, searchBreadCrumb, searchTotalPages, loading, error } = useSelector((state: RootState) => state.movie);

  useEffect(() => {
    if (!keyword.trim()) return;
    dispatch(searchMovie({ keyword, page }));
  }, [dispatch, keyword, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (searchTotalPages || 1)) return;
    router.replace(`/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      {/* ✅ Không dùng <Head>, dùng <title> trực tiếp */}
      <title>{searchSeoOnPage?.titleHead || `Kết quả tìm kiếm: ${keyword}`}</title>
      <meta name="description" content={searchSeoOnPage?.descriptionHead || `Tìm kiếm phim với từ khóa "${keyword}"`} />

      {/* 🏷️ Breadcrumb */}
      <div className="text-gray-400 mb-6">
        <Link href="/" className="hover:text-red-500">
          Trang Chủ
        </Link>
        {' > '}
        {Array.isArray(searchBreadCrumb) &&
          (searchBreadCrumb as BreadCrumbItem[]).map((crumb, index) => (
            <span key={index}>
              {crumb.isCurrent ? (
                crumb.name
              ) : (
                <Link href={crumb.slug} className="hover:text-red-500">
                  {crumb.name}
                </Link>
              )}
              {index < searchBreadCrumb.length - 1 && ' > '}
            </span>
          ))}
      </div>

      <h1 className="text-3xl font-bold mb-6">{searchSeoOnPage?.titleHead || `Kết quả tìm kiếm: "${keyword}"`}</h1>

      {loading ? (
        <div className="text-center py-10">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
        <div className="text-gray-400 text-center py-10">
          Không tìm thấy phim nào cho từ khóa &quot;<span className="text-white">{keyword}</span>&quot;
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.map((movie: Movie) => (
              <Link key={movie._id} href={`/phim/${movie.slug}`}>
                <MovieCard
                  movie={{
                    ...movie,
                    thumb_url: movie.thumb_url?.startsWith?.('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`,
                  }}
                />
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Pagination currentPage={page} totalPages={searchTotalPages || 1} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </div>
  );
}
