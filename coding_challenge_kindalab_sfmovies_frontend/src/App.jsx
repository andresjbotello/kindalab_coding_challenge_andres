import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMovies } from "./slices/slice";

import MapSection from "./components/map/Map";
import FooterSection from "./components/footer/Footer";

import "./App.css";

const location = {
  lat: 37.76800040588912,
  lng: -122.41851057001381,
};

const App = () => {
  const dispatch = useDispatch();

  // set movies
  useEffect(() => {
    fetch("http://localhost:8000/all-movies")
      .then((response) => response.json())
      .then((moviesData) => dispatch(setMovies({ movies: moviesData })));
  }, [dispatch]);

  return (
    <div className="App">
      <MapSection location={location} zoomLevel={0} />
      <FooterSection />
    </div>
  );
};

export default App;
