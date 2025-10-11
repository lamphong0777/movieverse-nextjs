import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BreadCrumbItem, Movie, MovieQueryParams, SeoOnPage } from '@/types';
import api from '@/lib/axios';

// Định nghĩa interface cho episode
interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

// Định nghĩa interface cho server
interface Server {
  server_name: string;
  server_data: Episode[];
}

// Định nghĩa interface cho movie details
interface MovieDetails extends Movie {
  episodes: Server[];
  movie: Movie;
}

interface MovieState {
  lists: { [key: string]: Movie[] };
  latestMovies: Movie[];
  movieDetails: MovieDetails | null;
  searchResults: Movie[];
  searchSeoOnPage: SeoOnPage | null;
  searchBreadCrumb: BreadCrumbItem[];
  searchTotalPages: number;
  loading: boolean;
  error: string | null;
  totalPages: { [key: string]: number };
}

const initialState: MovieState = {
  lists: {},
  latestMovies: [],
  movieDetails: null,
  searchResults: [],
  searchSeoOnPage: null,
  searchBreadCrumb: [],
  searchTotalPages: 1,
  loading: false,
  error: null,
  totalPages: {},
};

// Async thunk để lấy danh sách phim
export const fetchMovieList = createAsyncThunk('movie/fetchMovieList', async (params: MovieQueryParams, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams({
      page: params.page?.toString() || '1',
      sort_field: params.sort_field || 'modified.time',
      sort_type: params.sort_type || 'desc',
      sort_lang: params.sort_lang || 'vietsub',
      category: params.category || '',
      country: params.country || '',
      year: params.year?.toString() || '',
      limit: params.limit?.toString() || '10',
    }).toString();

    const response = await api.get(`/v1/api/danh-sach/${params.type}?${query}`);

    if (response.data.status && Array.isArray(response.data.data.items)) {
      return {
        items: response.data.data.items,
        type: params.type,
        totalPages: response.data.data.params.pagination.totalPages || 1,
      };
    } else {
      return rejectWithValue(response.data.msg || `Failed to fetch ${params.type}`);
    }
  } catch (error: unknown) {
    console.error('API error:', error);
    let message = `An error occurred while fetching ${params.type}`;
    if (error instanceof Error) {
      message = error.message;
    }
    return rejectWithValue(message);
  }
});

// Async thunk để lấy phim mới cập nhật
export const fetchLatestMovies = createAsyncThunk('movie/fetchLatestMovies', async (page: number = 1, { rejectWithValue }) => {
  try {
    const response = await api.get(`/danh-sach/phim-moi-cap-nhat-v3?page=${page}`);
    if (response.data.status) {
      return response.data.items;
    } else {
      return rejectWithValue(response.data.msg || 'Failed to fetch movies');
    }
  } catch (error: unknown) {
    console.error('API error:', error);
    let message = `An error occurred while fetching latest movies`;
    if (error instanceof Error) {
      message = error.message;
    }
    return rejectWithValue(message);
  }
});

// Async thunk để lấy chi tiết phim
export const fetchMovieDetails = createAsyncThunk('movie/fetchMovieDetails', async (slug: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/phim/${slug}`);
    if (response.data.status) {
      return response.data as MovieDetails;
    } else {
      return rejectWithValue(response.data.msg || `Failed to fetch movie details for ${slug}`);
    }
  } catch (error: unknown) {
    console.error('API error:', error);
    let message = `An error occurred while fetching movie details for ${slug}`;
    if (error instanceof Error) {
      message = error.message;
    }
    return rejectWithValue(message);
  }
});

// Tìm kiếm phim theo từ khóa
export const searchMovie = createAsyncThunk(
  'movie/searchMovie',
  async ({ keyword, page = 1, limit = 10 }: { keyword: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/api/tim-kiem`, {
        params: { keyword, page, limit },
      });

      if (response.data.status === 'success' && response.data.data) {
        const data = response.data.data;
        return {
          items: data.items || [],
          seoOnPage: data.seoOnPage || {},
          breadCrumb: data.breadCrumb || [],
          totalPages: data.params?.pagination?.totalPages || 1,
        };
      } else {
        return rejectWithValue(response.data.msg || 'Không thể tìm kiếm phim');
      }
    } catch (error: unknown) {
      console.error('API error:', error);
      let message = `An error occurred while fetching search results for ${keyword}`;
      if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

// Cập nhật movieSlice
export const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    setMovieList: (state, action: PayloadAction<{ type: string; movies: Movie[] }>) => {
      state.lists[action.payload.type] = action.payload.movies;
      state.loading = false;
    },
    setLatestMovies: (state, action: PayloadAction<Movie[]>) => {
      state.latestMovies = action.payload;
      state.loading = false;
    },
    setMovieDetails: (state, action: PayloadAction<MovieDetails>) => {
      state.movieDetails = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchMovieList
      .addCase(fetchMovieList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieList.fulfilled, (state, action: PayloadAction<{ items: Movie[]; type: string; totalPages: number }>) => {
        state.lists[action.payload.type] = action.payload.items;
        state.totalPages[action.payload.type] = action.payload.totalPages;
        state.loading = false;
      })
      .addCase(fetchMovieList.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Xử lý fetchLatestMovies
      .addCase(fetchLatestMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
        state.latestMovies = action.payload;
        state.loading = false;
      })
      .addCase(fetchLatestMovies.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Xử lý fetchMovieDetails
      .addCase(fetchMovieDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action: PayloadAction<MovieDetails>) => {
        state.movieDetails = action.payload;
        state.loading = false;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Xử lý searchMovie
      .addCase(searchMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchMovie.fulfilled,
        (
          state,
          action: PayloadAction<{
            items: Movie[];
            seoOnPage: SeoOnPage;
            breadCrumb: BreadCrumbItem[];
            totalPages: number;
          }>
        ) => {
          state.loading = false;
          state.searchResults = action.payload.items;
          state.searchSeoOnPage = action.payload.seoOnPage;
          state.searchBreadCrumb = action.payload.breadCrumb;
          state.searchTotalPages = action.payload.totalPages;
        }
      )
      .addCase(searchMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.searchResults = [];
      });
  },
});

export const { setMovieList, setLatestMovies, setMovieDetails, setLoading, setError } = movieSlice.actions;

export default movieSlice.reducer;
