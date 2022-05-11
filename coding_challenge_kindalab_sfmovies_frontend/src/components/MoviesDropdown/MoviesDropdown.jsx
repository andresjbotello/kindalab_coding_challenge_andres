import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { SelectPicker } from "rsuite";
import { setMovieLocations, setSelectedTitle } from "../../slices/slice";

const MoviesDropdown = () => {
  const movies = useSelector((state) => state.movies.movies);
  const selectedTitle = useSelector((state) => state.movies.selectedTitle);
  const dispatch = useDispatch();

  const handleSelectChange = (title) => {
    dispatch(setSelectedTitle({ title: title }));
    fetch(`http://localhost:8000/get-movie-locations-by-title/${title}`)
      .then((res) => res.json())
      .then((locationData) => {
        dispatch(setMovieLocations({ locations: locationData }));
      });
  };

  return (
    <div style={{paddingLeft: 10}}>
      <SelectPicker
        style={{ width: 400 }}
        data={movies}
        labelKey="title"
        valueKey="title"
        onSelect={(value, item, _e) => handleSelectChange(value)}
      />
    </div>
  );
};

export default MoviesDropdown;
