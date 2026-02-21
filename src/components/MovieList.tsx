'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { fetchMovieList } from '@/redux/features/movieSlice'
import { useAppDispatch } from '@/redux/hooks'
import { RootState } from '@/redux/store'

import Loading from '@/components/Loading'
import Pagination from '@/components/Pagination'
import MovieBreadcrumb from '@/components/movie/MovieBreadcrumb'
import MovieFilterBar from '@/components/movie/MovieFilterBar'
import MovieGrid from '@/components/movie/MovieGrid'

import { MovieQueryParams } from '@/types'

interface MovieListProps {
  routeType: MovieQueryParams['type']
  searchParams: ReturnType<typeof useSearchParams>
}

export default function MovieList({ routeType, searchParams }: MovieListProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const { lists, totalPages, loading, error } = useSelector((s: RootState) => s.movie)

  const initialFilters = useMemo<MovieQueryParams>(() => {
    return {
      type: routeType,
      page: Number(searchParams.get('page') || 1),
      sort_field: searchParams.get('sort_field') || 'modified.time',
      sort_type: searchParams.get('sort_type') || 'desc',
      sort_lang: searchParams.get('sort_lang') || 'vietsub',
      category: '',
      country: '',
      year: '',
      limit: 24,
    }
  }, [routeType, searchParams])

  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    dispatch(fetchMovieList(filters))

    const q = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) q.set(k, String(v))
    })

    router.replace(`/danh-sach/${filters.type}?${q.toString()}`)
  }, [filters, dispatch, router])

  const movies = lists[filters.type] || []
  const pages = totalPages[filters.type] || 1

  const onFilterChange = <K extends keyof MovieQueryParams>(key: K, value: MovieQueryParams[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <MovieBreadcrumb type={filters.type} page={filters.page} />

      <MovieFilterBar filters={filters} onChange={onFilterChange} />

      {loading && <Loading />}
      {error && <div className="text-center text-red-500">Lỗi: {error}</div>}

      {!loading && !error && <MovieGrid movies={movies} />}

      <Pagination
        currentPage={filters.page}
        totalPages={pages}
        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
      />
    </div>
  )
}
