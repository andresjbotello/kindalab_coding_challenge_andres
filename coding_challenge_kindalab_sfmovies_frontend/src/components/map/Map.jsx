import React, { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";
import { useSelector, useDispatch } from "react-redux";
import { Icon } from "@iconify/react";
import { Button } from "rsuite";
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
    fetch(`http://localhost:8000/get-geolocations/`, {
      method: "POST",
      body: JSON.stringify({ addresses: locations }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((coordinates) =>
        dispatch(setGeoLocations({ geoLocations: coordinates }))
      );
  };

  return (
    <div className="map">
      <div style={{ height: "15vh" }}>
        <h5 style={{ padding: 10 }}>
          See the locations in which the movie you selected was filmed
        </h5>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <MoviesDropdown />
          <Button
            onClick={() => handleGeoLocations()}
            disabled={locations.length == 0}
          >
            Set Markers
          </Button>
          <Button
            onClick={() => dispatch(removeGeoLocations())}
            disabled={geoLocations.length == 0}
          >
            Remove Markers
          </Button>
        </div>
      </div>

      <div className="google-map">
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
          defaultCenter={location}
          defaultZoom={zoomLevel}
        >
          {geoLocations
            ? geoLocations.length > 0
              ? geoLocations.map((loc, index) => (
                  <LocationPin key={index} lat={loc.lat} lng={loc.lng} />
                ))
              : null
            : null}
        </GoogleMapReact>
      </div>
    </div>
  );
};

export default Map;
