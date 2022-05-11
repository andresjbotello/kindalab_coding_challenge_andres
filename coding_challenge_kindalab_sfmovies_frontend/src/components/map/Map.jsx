import React from "react";
import GoogleMapReact from "google-map-react";
import { useSelector, useDispatch } from "react-redux";
import { Icon } from "@iconify/react";
import locationIcon from "@iconify/icons-mdi/map-marker";

import "./map.css";
import MoviesDropdown from "../MoviesDropdown/MoviesDropdown";
import { removeGeoLocations, setGeoLocations } from "../../slices/slice";

const LocationPin = () => (
  <div className="pin">
    <Icon icon={locationIcon} className="pin-icon" />
  </div>
);

const Map = ({ location, zoomLevel }) => {
  const locations = useSelector((state) => state.movies.locations);
  const geoLocations = useSelector((state) => state.movies.geoLocations);
  const dispatch = useDispatch();

  const handleGeoLocations = () => {
    locations.map((addr) => {
      fetch(`http://localhost:8000/get-geolocation/${addr}`)
        .then((res) => res.json())
        .then((coord) => {
          console.log("addr: ", addr)
          console.log("latLng: ",coord)
          dispatch(setGeoLocations({geoLocations: [...geoLocations, coord]}));
        });
    });

  } 

  return (
    <div className="map">
      <div>
        <MoviesDropdown />
        <button 
          onClick={() => handleGeoLocations()} 
          disabled={locations.length == 0}
        >
          Set Markers
        </button>
        <button 
          onClick={() => dispatch(removeGeoLocations())} 
          disabled={geoLocations.length == 0}
        >
          Remove Markers
        </button>
      </div>
      <h3 className="map-h3">See the locations in which the movie you selected were filmed</h3>

      <div className="google-map">
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
          defaultCenter={location}
          defaultZoom={zoomLevel}
        >
          {geoLocations? (
            geoLocations.map((loc, index) => (<LocationPin key={index} lat={loc.lat} lng={loc.lng} />))
          ): null}
        </GoogleMapReact>
      </div>
    </div>
  );
};

export default Map;
