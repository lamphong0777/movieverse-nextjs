'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchMovieList } from '@/redux/features/movieSlice';
import { RootState } from '@/redux/store';
import MovieCard from '@/components/MovieCard';
import Loading from '@/components/Loading';
import Pagination from '@/components/Pagination';
import { useAppDispatch } from '@/redux/hooks';
import { Movie, MovieQueryParams } from '@/types';

const formatType = (t: string) => {
  const map: Record<string, string> = {
    'phim-le': 'Phim Lẻ',
    'phim-bo': 'Phim Bộ',
    'tv-shows': 'Chương Trình TV',
    'hoat-hinh': 'Hoạt Hình',
    'phim-vietsub': 'Phim Vietsub',
    'phim-thuyet-minh': 'Phim Thuyết Minh',
    'phim-long-tieng': 'Phim Lồng Tiếng',
  };
  return map[t] || t;
};

const formatLang = (l: string) => {
  const map: Record<string, string> = {
    vietsub: 'Vietsub',
    'thuyet-minh': 'Thuyết Minh',
    'long-tieng': 'Lồng Tiếng',
  };
  return map[l] || l;
};

const getInitialFilters = (type: MovieQueryParams['type'], sp: ReturnType<typeof useSearchParams>): MovieQueryParams => {
  const page = Number(sp.get('page') || 1);
  const yearParam = sp.get('year');

  return {
    type,
    page,
    sort_field: sp.get('sort_field') || 'modified.time',
    sort_type: sp.get('sort_type') || 'desc',
    sort_lang: sp.get('sort_lang') || 'vietsub',
    category: sp.get('category') || '',
    country: sp.get('country') || '',
    year: yearParam ? Number(yearParam) : '',
    limit: Number(sp.get('limit') || 10),
  };
};

interface MovieListProps {
  routeType: MovieQueryParams['type'];
  searchParams: ReturnType<typeof useSearchParams>;
}

export default function MovieList({ routeType, searchParams }: MovieListProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // const params = useParams();
  // const searchParams = useSearchParams();

  // const routeType = params?.type as string;
  const redux = useSelector((s: RootState) => s.movie);
  const { lists, totalPages, loading, error } = redux;

  const [filters, setFilters] = useState(() => getInitialFilters(routeType as MovieQueryParams['type'], searchParams));
  const skipReplace = useRef(false);
  const firstMount = useRef(true);

  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (!routeType) return;
    const newFilters = getInitialFilters(routeType as MovieQueryParams['type'], searchParams);
    setFilters(newFilters);
    skipReplace.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeType, searchParamsString]);

  useEffect(() => {
    dispatch(fetchMovieList(filters));

    const q = new URLSearchParams();
    if (filters.page) q.set('page', String(filters.page));
    if (filters.sort_field) q.set('sort_field', filters.sort_field);
    if (filters.sort_type) q.set('sort_type', filters.sort_type);
    if (filters.sort_lang) q.set('sort_lang', filters.sort_lang);
    if (filters.category) q.set('category', filters.category);
    if (filters.country) q.set('country', filters.country);
    if (filters.year) q.set('year', String(filters.year));
    if (filters.limit) q.set('limit', String(filters.limit));

    const qs = q.toString();
    if (skipReplace.current) {
      skipReplace.current = false;
      firstMount.current = false;
      return;
    }
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }

    router.replace(`/danh-sach/${filters.type}${qs ? `?${qs}` : ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = <K extends keyof MovieQueryParams>(key: K, value: MovieQueryParams[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setFilters((prev) => ({ ...prev, page }));
  };

  const movies = lists[filters.type] || [];
  const pages = totalPages[filters.type] || 1;

  const typeListOptions = ['phim-le', 'phim-bo', 'tv-shows', 'hoat-hinh', 'phim-vietsub', 'phim-thuyet-minh', 'phim-long-tieng'];
  const sortFieldOptions = ['modified.time', '_id', 'year'];
  const sortTypeOptions = ['asc', 'desc'];
  const sortLangOptions = ['vietsub', 'thuyet-minh', 'long-tieng'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* <h1 className="text-2xl font-bold text-white mb-4">{formatType(filters.type)}</h1> */}

      <div className="text-gray-400 mb-6">
        <Link href="/" className="hover:text-red-500">
          Trang Chủ
        </Link>{' '}
        {'>'}{' '}
        <Link href={`/danh-sach/${filters.type}`} className="hover:text-red-500">
          {formatType(filters.type)}
        </Link>{' '}
        {'>'} Trang {filters.page}
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-gray-800 p-4 rounded-lg">
        <div>
          <label className="block text-gray-300 mb-2">Loại</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value as MovieQueryParams['type'])}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3"
          >
            {typeListOptions.map((t) => (
              <option key={t} value={t}>
                {formatType(t)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Sắp xếp theo</label>
          <select
            value={filters.sort_field}
            onChange={(e) => handleFilterChange('sort_field', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3"
          >
            {sortFieldOptions.map((f) => (
              <option key={f} value={f}>
                {f === 'modified.time' ? 'Thời gian cập nhật' : f === '_id' ? 'ID' : 'Năm phát hành'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Thứ tự</label>
          <select
            value={filters.sort_type}
            onChange={(e) => handleFilterChange('sort_type', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3"
          >
            {sortTypeOptions.map((s) => (
              <option key={s} value={s}>
                {s === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Ngôn ngữ</label>
          <select
            value={filters.sort_lang}
            onChange={(e) => handleFilterChange('sort_lang', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3"
          >
            {sortLangOptions.map((l) => (
              <option key={l} value={l}>
                {formatLang(l)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-white text-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">Error: {error}</div>
      ) : movies.length === 0 ? (
        <div className="text-white text-center">Không tìm thấy phim nào.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie: Movie) => (
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
      )}

      <Pagination currentPage={filters.page} totalPages={pages} onPageChange={handlePageChange} />
    </div>
  );
}
