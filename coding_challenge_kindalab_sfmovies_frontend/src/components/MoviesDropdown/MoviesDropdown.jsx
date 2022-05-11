import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import { setMovieLocations, setSelectedTitle } from "../../slices/slice";

const MoviesDropdown = () => {
  const movies = useSelector((state) => state.movies.movies)
  const selectedTitle = useSelector((state) => state.movies.selectedTitle)
  const dispatch = useDispatch()

  const handleSelectChange = (title) => {
    dispatch(setSelectedTitle({title: title}))
    fetch(`http://localhost:8000/get-movie-locations-by-title/${title}`)
      .then((res) => res.json())
      .then((locationData) => {
        dispatch(setMovieLocations({locations: locationData}))
      });
  };

  return (
    <>
      <label htmlFor="movies">Select a movie</label>
      <select 
        onChange={(e) => handleSelectChange(e.target.value)}
        value={selectedTitle}
      >
        {movies.length > 0
          ? movies.map((movie) => (
              <option
                key={`${movie.title}-${Math.random()}`}
                value={movie.title}
              >
                {movie.title}
              </option>
            ))
          : null}
      </select>
    </>
  );
};

export default MoviesDropdown;
