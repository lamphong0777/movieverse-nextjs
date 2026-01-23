'use client'

import Loading from '@/components/Loading'
import MovieCard from '@/components/MovieCard'
import Pagination from '@/components/Pagination'
import MovieFilterBar from '@/components/movie/MovieFilterBar'
import { fetchMoviesByCountry } from '@/redux/features/countrySlice'
import { useAppDispatch } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import { BreadCrumbItem, CountryQueryParams, Movie } from '@/types'
import Head from 'next/head'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

export default function CountryDetail() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const countrySlug = params?.slug as string

  const { movies, totalPages, loading, error, seoOnPage, breadCrumb } = useSelector(
    (s: RootState) => s.country,
  )

  const initialFilters = useMemo<CountryQueryParams>(() => {
    return {
      country: countrySlug,
      page: Number(searchParams.get('page') || 1),
      sort_field: searchParams.get('sort_field') || '_id',
      sort_type: searchParams.get('sort_type') || 'desc',
      sort_lang: searchParams.get('sort_lang') || 'vietsub',
      year: searchParams.get('year') ? Number(searchParams.get('year')) : '',
      limit: Number(searchParams.get('limit') || 10),
    }
  }, [countrySlug, searchParams])

  const [filters, setFilters] = useState<CountryQueryParams>(initialFilters)

  useEffect(() => {
    if (!countrySlug) return

    dispatch(
      fetchMoviesByCountry({
        slug: countrySlug,
        ...filters,
      }),
    )

    const q = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) {
        q.set(k, String(v))
      }
    })

    router.replace(`/quoc-gia/${countrySlug}?${q.toString()}`)
  }, [filters, countrySlug, dispatch, router])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Head>
        <title>{seoOnPage?.titleHead || 'Quốc gia'}</title>
        <meta name="description" content={seoOnPage?.descriptionHead || ''} />
      </Head>

      {/* Breadcrumb */}
      <div className="text-gray-400 text-sm">
        <Link href="/" className="hover:text-red-500">
          Trang chủ
        </Link>
        {' > '}
        {Array.isArray(breadCrumb) &&
          (breadCrumb as BreadCrumbItem[]).map((c, i) => (
            <span key={i}>
              {c.isCurrent ? (
                c.name
              ) : (
                <Link href={c.slug} className="hover:text-red-500">
                  {c.name}
                </Link>
              )}
              {i < breadCrumb.length - 1 && ' > '}
            </span>
          ))}
      </div>

      <MovieFilterBar
        filters={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v, page: 1 }))}
        showYear
      />

      {loading && <Loading />}

      {error && <div className="text-center text-red-500">Lỗi: {error}</div>}

      {!loading && !error && (
        <>
          {Array.isArray(movies) && movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie: Movie) => (
                <Link key={movie._id} href={`/phim/${movie.slug}`}>
                  <MovieCard movie={movie} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-white">Không tìm thấy phim nào.</div>
          )}
        </>
      )}

      <Pagination
        currentPage={filters.page}
        totalPages={totalPages || 1}
        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
      />
    </div>
  )
}
