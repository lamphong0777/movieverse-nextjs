'use client'

import Loading from '@/components/Loading'
import Pagination from '@/components/Pagination'
import MovieBreadcrumb from '@/components/movie/MovieBreadcrumb'
import MovieFilterBar from '@/components/movie/MovieFilterBar'
import MovieGrid from '@/components/movie/MovieGrid'
import { fetchMoviesByCategory } from '@/redux/features/categorySlice'
import { useAppDispatch } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import Head from 'next/head'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { CategoryQueryParams } from '@/types'

export default function CategoryDetail() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const categorySlug = params?.slug as string

  const slug = params.slug as string

  const { movies, totalPages, loading, error, seoOnPage } = useSelector(
    (s: RootState) => s.category,
  )

  const initialFilters = useMemo<CategoryQueryParams>(() => {
    return {
      category: slug,
      page: Number(searchParams.get('page') || 1),
      sort_field: searchParams.get('sort_field') || '_id',
      sort_type: searchParams.get('sort_type') || 'desc',
      sort_lang: searchParams.get('sort_lang') || 'vietsub',
      country: searchParams.get('country') || '',
      year: searchParams.get('year') ? Number(searchParams.get('year')) : '',
      limit: 24,
    }
  }, [slug, searchParams])

  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    dispatch(
      fetchMoviesByCategory({
        slug: categorySlug,
        ...filters, // filters là MovieQueryParams nhưng KHÔNG cần slug
      }),
    )

    const q = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) q.set(k, String(v))
    })

    router.replace(`/the-loai/${slug}?${q.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dispatch, router, slug])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Head>
        <title>{seoOnPage?.titleHead || 'Thể loại'}</title>
        <meta name="description" content={seoOnPage?.descriptionHead || ''} />
      </Head>

      <MovieBreadcrumb type={slug} page={filters.page} />

      <MovieFilterBar
        filters={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v, page: 1 }))}
        showCountry
        showYear
      />

      {loading && <Loading />}
      {error && <div className="text-center text-red-500">Lỗi: {error}</div>}

      {!loading && !error && <MovieGrid movies={movies || []} />}

      <Pagination
        currentPage={filters.page}
        totalPages={totalPages || 1}
        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
      />
    </div>
  )
}
