'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchMoviesByCountry } from '@/redux/features/countrySlice';
import { RootState } from '@/redux/store';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import Head from 'next/head';
import { useAppDispatch } from '@/redux/hooks';
import { BreadCrumbItem, Movie, MovieQueryParams } from '@/types';

const formatLang = (l: string) => {
  const map: Record<string, string> = {
    vietsub: 'Vietsub',
    'thuyet-minh': 'Thuyết Minh',
    'long-tieng': 'Lồng Tiếng',
  };
  return map[l] || l;
};

const getInitialFilters = (country: string, sp: ReturnType<typeof useSearchParams>) => {
  const page = Number(sp.get('page') || 1);
  const yearParam = sp.get('year');
  return {
    country,
    page,
    sort_field: sp.get('sort_field') || '_id',
    sort_type: sp.get('sort_type') || 'asc',
    sort_lang: sp.get('sort_lang') || 'vietsub',
    category: sp.get('category') || '',
    year: yearParam ? Number(yearParam) : '',
    limit: Number(sp.get('limit') || 10),
  };
};

export default function CountryDetail() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const countrySlug = params?.slug as string;
  const { movies, totalPages, loading, error, seoOnPage, breadCrumb } = useSelector((s: RootState) => s.country);

  const [filters, setFilters] = useState(() => getInitialFilters(countrySlug, searchParams));
  const skipReplace = useRef(false);
  const firstMount = useRef(true);

  const searchParamsString = searchParams.toString();

  // Cập nhật filter khi slug hoặc URL thay đổi
  useEffect(() => {
    if (!countrySlug) return;
    const newFilters = getInitialFilters(countrySlug, searchParams);
    setFilters(newFilters);
    skipReplace.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countrySlug, searchParamsString]);

  // Fetch phim theo quốc gia
  useEffect(() => {
    if (!countrySlug) return;
    dispatch(fetchMoviesByCountry({ slug: countrySlug, ...filters }));

    const q = new URLSearchParams();
    if (filters.page) q.set('page', String(filters.page));
    if (filters.sort_field) q.set('sort_field', filters.sort_field);
    if (filters.sort_type) q.set('sort_type', filters.sort_type);
    if (filters.sort_lang) q.set('sort_lang', filters.sort_lang);
    if (filters.category) q.set('category', filters.category);
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

    router.replace(`/quoc-gia/${countrySlug}${qs ? `?${qs}` : ''}`);
  }, [filters, countrySlug, dispatch, router]);

  const handleFilterChange = <K extends keyof MovieQueryParams>(key: K, value: MovieQueryParams[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setFilters((prev) => ({ ...prev, page }));
  };

  const sortFieldOptions = ['_id', 'year', 'modified.time'];
  const sortTypeOptions = ['asc', 'desc'];
  const sortLangOptions = ['vietsub', 'thuyet-minh', 'long-tieng'];
  const categoryOptions = ['hanh-dong', 'hai-huoc', 'tinh-cam', 'kinh-di', 'phieu-luu', 'co-trang', 'vien-tuong', 'tam-ly'];
  const yearOptions = Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 2025 - i);

  const safeTotalPages = typeof totalPages === 'number' ? totalPages : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Head>
        <title>{seoOnPage?.titleHead || 'Quốc Gia'}</title>
        <meta name="description" content={seoOnPage?.descriptionHead || ''} />
        {seoOnPage?.og_image?.[0] && <meta property="og:image" content={`https://phimimg.com${seoOnPage.og_image[0]}`} />}
        <meta property="og:type" content={seoOnPage?.og_type || 'website'} />
        <meta property="og:url" content={seoOnPage?.og_url ? `https://phimapi.com/${seoOnPage.og_url}` : ''} />
      </Head>

      {/* <h1 className="text-3xl font-bold text-white mb-4">{seoOnPage?.titleHead || 'Phim Quốc Gia'}</h1> */}

      <div className="text-gray-400 mb-6">
        <Link href="/" className="hover:text-red-500">
          Trang Chủ
        </Link>
        {' > '}
        {Array.isArray(breadCrumb) &&
          (breadCrumb as BreadCrumbItem[]).map((crumb, index) => (
            <span key={index}>
              {crumb.isCurrent ? (
                crumb.name
              ) : (
                <Link href={crumb.slug} className="hover:text-red-500">
                  {crumb.name}
                </Link>
              )}
              {index < breadCrumb.length - 1 && ' > '}
            </span>
          ))}
      </div>

      {/* 🎛️ Bộ lọc */}
      <div className="mb-6 grid grid-cols-2 text-xs md:text-md lg:grid-cols-5 gap-4 bg-gray-800 p-4 rounded-lg">
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

        <div>
          <label className="block text-gray-300 mb-2">Thể loại</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3"
          >
            <option value="">Tất cả</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Năm phát hành</label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3"
          >
            <option value="">Tất cả</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📽️ Danh sách phim */}
      {loading ? (
        <div className="text-white text-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">Lỗi: {error}</div>
      ) : !Array.isArray(movies) || movies.length === 0 ? (
        <div className="text-white text-center">Không tìm thấy phim nào.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie: Movie) => (
            <Link key={movie._id} href={`/phim/${movie.slug}`}>
              <MovieCard
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

      {/* 📄 Phân trang */}
      <Pagination currentPage={filters.page} totalPages={safeTotalPages} onPageChange={handlePageChange} />
    </div>
  );
}
