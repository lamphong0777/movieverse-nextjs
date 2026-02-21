'use client'

import { useParams, useSearchParams } from 'next/navigation'
import MovieList from '@/components/MovieList'
import { MovieQueryParams } from '@/types'

export default function MovieListPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  return (
    <MovieList routeType={params.type as MovieQueryParams['type']} searchParams={searchParams} />
  )
}
