import * as React from "react";
import * as ReactDom from "react-dom";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { createCustomEqual } from "fast-equals";
import { isLatLngLiteral } from "@googlemaps/typescript-guards";
import Marker from "./components/Marker";

const render = (status: Status) => {
  return <h1>{status}</h1>;
};

const App: React.FC = () => {
  const [clicks, setClicks] = React.useState<google.maps.LatLng[]>([]);
  const [zoom, setZoom] = React.useState(3); // initial zoom
  const [center, setCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0,
  });

  const [movies, setMovies] = React.useState<any>([]);
  const [movieLocationsAddr, setMovieLocationsAddr] = React.useState<string[]>([]); // list with addresses
  const [numberOfLocations, setNumberOfLocations] = React.useState<number>(0)


  const onClick = (e: google.maps.MapMouseEvent) => {
    // avoid directly mutating state
    setClicks([...clicks, e.latLng!]);
  };

  const onIdle = (m: google.maps.Map) => {
    console.log("onIdle");
    setZoom(m.getZoom()!);
    setCenter(m.getCenter()!.toJSON());
  };

  React.useEffect(() => {
    if (movies.length == 0) {
      fetch("http://localhost:8000/all-movies")
        .then((response) => response.json())
        .then((moviesData) => setMovies(moviesData));
    }
  }, [movies]);

  React.useEffect(() => {
    if (movieLocationsAddr.length === numberOfLocations) {
      // get coordinates from backend and set markers on map
      let coordinates: google.maps.LatLng[] = []
      movieLocationsAddr.map((addr) => {
        fetch(`http://localhost:8000/get-geolocation/${addr}`)
          .then((res) => res.json())
          .then((coord) => {
            let latLng = new google.maps.LatLng(
              coord["lat"],
              coord["lng"]
            );
            coordinates.push(latLng)
          });
      });
      setClicks(coordinates);
    }
  }, [movieLocationsAddr]);

  const form = (
    <div
      style={{
        padding: "1rem",
        flexBasis: "250px",
        height: "100%",
        overflow: "auto",
      }}
    >
      <label htmlFor="movies">Select a movie</label>
      <select
        onChange={(e) => {
          let title = e.target.value;
          fetch(`http://localhost:8000/get-movie-locations-by-title/${title}`)
            .then((res) => res.json())
            .then((locationData) => {
              setNumberOfLocations(locationData.length)
              setMovieLocationsAddr(locationData)
            });
          
        }}
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
      <br />
      <label htmlFor="zoom">Zoom</label>
      <input
        type="number"
        id="zoom"
        name="zoom"
        value={zoom}
        onChange={(event) => setZoom(Number(event.target.value))}
      />
      <br />
      <label htmlFor="lat">Latitude</label>
      <input
        type="number"
        id="lat"
        name="lat"
        value={center.lat}
        onChange={(event) =>
          setCenter({ ...center, lat: Number(event.target.value) })
        }
      />
      <br />
      <label htmlFor="lng">Longitude</label>
      <input
        type="number"
        id="lng"
        name="lng"
        value={center.lng}
        onChange={(event) =>
          setCenter({ ...center, lng: Number(event.target.value) })
        }
      />
      <h3>Markers</h3>
      <button onClick={() => setClicks([])}>Clear markers</button>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!}
        render={render}
      >
        <Map
          center={center}
          onClick={onClick}
          onIdle={onIdle}
          zoom={zoom}
          style={{ flexGrow: "1", height: "100%" }}
        >
          {clicks.map((latLng, i) => (
            <Marker key={i} position={latLng} />
          ))}
        </Map>
      </Wrapper>
      {/* Basic form for controlling center and zoom of map. */}
      {form}
    </div>
  );
};

interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
}
const deepCompareEqualsForMaps = createCustomEqual(
  (deepEqual) => (a: any, b: any) => {
    if (
      isLatLngLiteral(a) ||
      a instanceof google.maps.LatLng ||
      isLatLngLiteral(b) ||
      b instanceof google.maps.LatLng
    ) {
      return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
    }

    return deepEqual(a, b);
  }
);

function useDeepCompareMemoize(value: any) {
  const ref = React.useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

function useDeepCompareEffectForMaps(
  callback: React.EffectCallback,
  dependencies: any[]
) {
  React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

const Map: React.FC<MapProps> = ({
  onClick,
  onIdle,
  children,
  style,
  ...options
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map>();

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);

  // because React does not do deep comparisons, a custom hook is used
  // see discussion in https://github.com/googlemaps/js-samples/issues/946
  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  React.useEffect(() => {
    if (map) {
      ["click", "idle"].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      );

      if (onClick) {
        map.addListener("click", onClick);
      }

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);

  return (
    <>
      <div ref={ref} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          return React.cloneElement(child, { map });
        }
      })}
    </>
  );
};


window.addEventListener("DOMContentLoaded", () => {
  ReactDom.render(<App />, document.getElementById("root"));
});

export {};
