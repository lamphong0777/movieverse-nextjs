import api from '@/lib/axios'
import { Category, CategoryMovieParams, SeoOnPage } from '@/types'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchMoviesByCategory = createAsyncThunk(
  'category/fetchMoviesByCategory',
  async ({ slug, ...filters }: CategoryMovieParams) => {
    const response = await api.get(`/v1/api/the-loai/${slug}`, {
      params: filters,
    })
    return response.data.data
  },
)

export const fetchCategories = createAsyncThunk('category/fetchCategories', async () => {
  const response = await api.get('/the-loai')
  return response.data
})

interface CategoryState {
  movies: []
  totalPages: number
  loading: boolean
  error: string | null
  seoOnPage: SeoOnPage
  breadCrumb: unknown[]
  categories: Category[]
}

const initialState: CategoryState = {
  movies: [],
  totalPages: 1,
  loading: false,
  error: null,
  seoOnPage: {},
  breadCrumb: [],
  categories: [],
}

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoviesByCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMoviesByCategory.fulfilled, (state, action) => {
        state.loading = false
        state.movies = Array.isArray(action.payload.items) ? action.payload.items : []
        state.totalPages = Number(action.payload?.params?.pagination?.totalPages) || 1
        state.seoOnPage = action.payload.seoOnPage || {}
        state.breadCrumb = Array.isArray(action.payload.breadCrumb) ? action.payload.breadCrumb : []
      })
      .addCase(fetchMoviesByCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch movies'
        state.movies = []
        state.totalPages = 1
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch categories'
        state.categories = []
      })
  },
})

export default categorySlice.reducer
