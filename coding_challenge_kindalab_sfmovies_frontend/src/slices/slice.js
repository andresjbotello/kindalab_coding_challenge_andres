import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedTitle: "",
  movies: [],
  locations: [],
  geoLocations: [],
};

export const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setSelectedTitle: (state, action) => {
      state.selectedTitle = action.payload.title;
    },
    setMovies: (state, action) => {
      state.movies = action.payload.movies;
    },
    setMovieLocations: (state, action) => {
      state.locations = action.payload.locations;
    },
    setGeoLocations: (state, action) => {
      state.geoLocations = action.payload.geoLocations;
    },
    removeGeoLocations: (state, _action) => {
      state.geoLocations = []
      state.locations = []
    }
  },
});

export const {
  setSelectedTitle,
  setMovies,
  setMovieLocations,
  setGeoLocations,
  removeGeoLocations
} = movieSlice.actions;

export default movieSlice.reducer;
