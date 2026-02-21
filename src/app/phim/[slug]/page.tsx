import MoviePage from '@/features/MoviePage'

export default function Page({ params }: { params: { slug: string } }) {
  return <MoviePage params={Promise.resolve(params)} />
}
