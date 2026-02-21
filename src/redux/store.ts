// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit'
import movieReducer from './features/movieSlice'
import categoryReducer from './features/categorySlice'
import countryReducer from './features/countrySlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      movie: movieReducer,
      category: categoryReducer,
      country: countryReducer,
    },
  })
}

// Định nghĩa các kiểu (types) cho ứng dụng Redux
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
