export interface Movie {
  _id: string
  name: string
  slug: string
  origin_name: string
  type: string
  poster_url: string
  thumb_url: string
  sub_docquyen: boolean
  time: string
  episode_current: string
  quality: string
  lang: string
  year: number
  category: { id: string; name: string; slug: string }[]
  country: { id: string; name: string; slug: string }[]
  tmdb: {
    type: string | null
    id: string | null
    season: number | null
    vote_average: number
    vote_count: number
  }
  imdb: {
    id: string | null
  }
  modified: {
    time: string
  }
  actor?: string[]
  director?: string[]
  content?: string
  trailer_url?: string
  [key: string]: unknown
}

export interface Episode {
  name: string
  slug: string
  filename: string
  link_embed: string
  link_m3u8: string
}

export interface Server {
  server_name: string
  server_data: Episode[]
}

export interface MovieDetails {
  tmdb: { type: string; id: string; season: number; vote_average: number; vote_count: number }
  imdb: { id: string | null }
  created: { time: string }
  modified: { time: string }
  _id: string
  name: string
  slug: string
  origin_name: string
  content: string
  type: string
  status: string
  poster_url: string
  thumb_url: string
  is_copyright: boolean
  sub_docquyen: boolean
  chieurap: boolean
  trailer_url: string
  time: string
  episode_current: string
  episode_total: string
  quality: string
  lang: string
  notify: string
  showtimes: string
  year: number
  view: number
  actor: string[]
  director: string[]
  category: { id: string; name: string; slug: string }[]
  country: { id: string; name: string; slug: string }[]
  episodes: Server[]
}

export interface Category {
  _id: string
  name: string
  slug: string
  [key: string]: unknown
}

export interface Country {
  _id: string
  name: string
  slug: string
  [key: string]: unknown
}

export interface SeoOnPage {
  og_type?: string
  titleHead?: string
  descriptionHead?: string
  og_url?: string
  og_image?: string[]
  [key: string]: unknown
}

export interface MovieQueryParams {
  type:
    | 'phim-bo'
    | 'phim-le'
    | 'tv-shows'
    | 'hoat-hinh'
    | 'phim-vietsub'
    | 'phim-thuyet-minh'
    | 'phim-long-tieng'
  page: number
  sort_field?: 'modified.time' | '_id' | 'year' | string // ✅ cho phép cả string
  sort_type?: 'asc' | 'desc' | string // ✅ linh hoạt
  sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng' | string // ✅ linh hoạt
  category?: string
  country?: string
  year?: string | number
  limit?: number
}

export interface BreadCrumbItem {
  name: string
  slug: string
  isCurrent?: boolean
}

export interface MovieFilterParams {
  page: number
  sort_field?: string
  sort_type?: string
  sort_lang?: string
  country?: string
  year?: string | number
  limit?: number
}

export type CategoryQueryParams = Omit<MovieQueryParams, 'type'> & {
  category: string
}

export interface CategoryMovieParams extends MovieFilterParams {
  slug: string
}

export type CountryQueryParams = MovieFilterParams & {
  country: string
}

export interface MovieVideoPlayerProps {
  src: string
  poster?: string
}
