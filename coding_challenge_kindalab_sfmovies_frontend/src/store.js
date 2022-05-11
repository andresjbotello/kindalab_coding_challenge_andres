import { configureStore } from '@reduxjs/toolkit'
import moviesReducer from "./slices/slice"

export const store = configureStore({
  reducer: {
      movies: moviesReducer,
  },
})