import api from '@/lib/axios';
import { Country, SeoOnPage } from '@/types';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Lấy danh sách phim theo quốc gia
export const fetchMoviesByCountry = createAsyncThunk(
  'country/fetchMoviesByCountry',
  async ({
    slug,
    ...filters
  }: {
    slug: string;
    page: number;
    sort_field: string;
    sort_type: string;
    sort_lang: string;
    category: string;
    year: string | number;
    limit: number;
  }) => {
    const response = await api.get(`/v1/api/quoc-gia/${slug}`, { params: filters });
    return response.data.data;
  }
);

// Lấy danh sách quốc gia
export const fetchCountries = createAsyncThunk('country/fetchCountries', async () => {
  const response = await api.get('/quoc-gia');
  return response.data;
});

interface CountryState {
  movies: [];
  totalPages: number;
  loading: boolean;
  error: string | null;
  seoOnPage: SeoOnPage;
  breadCrumb: unknown[];
  countries: Country[];
}

const initialState: CountryState = {
  movies: [],
  totalPages: 1,
  loading: false,
  error: null,
  seoOnPage: {},
  breadCrumb: [],
  countries: [],
};

// Slice
const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Movies
      .addCase(fetchMoviesByCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoviesByCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.totalPages = Number(action.payload?.params?.pagination?.totalPages) || 1;
        state.seoOnPage = action.payload?.seoOnPage || {};
        state.breadCrumb = Array.isArray(action.payload?.breadCrumb) ? action.payload.breadCrumb : [];
      })
      .addCase(fetchMoviesByCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch movies by country';
        state.movies = [];
        state.totalPages = 1;
      })

      // Fetch Countries
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch countries';
        state.countries = [];
      });
  },
});

export default countrySlice.reducer;
