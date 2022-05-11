import json
from fastapi import FastAPI, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import config

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AddressesList(BaseModel):
    addresses: list[str]


@app.get("/all-movies")
async def get_all_movies():
    """Returns all movies"""
    data = requests.get(config.MOVIES_UNIQUE_TITLES_URL, headers={
                        "X-App-Token": config.APP_TOKEN,})
    data = json.loads(data.content.decode('utf-8'))

    return data


@app.get("/filter-by-title/{title}")
async def filter_movie_by_title(title: str):
    """Returns the movies that match the title"""
    data = requests.get(f"{config.EXT_API_BASEURL}?$where=title like '{title}'", headers={
                        "X-App-Token": config.APP_TOKEN})
    return json.loads(data.content.decode('utf-8'))


@app.get("/get-movie-locations-by-title/{title}")
async def get_movie_by_title(title: str):
    """Returns the locations of the movie that match the title"""
    data = requests.get(f"{config.EXT_API_BASEURL}?title='{title}'", headers={
                        "X-App-Token": config.APP_TOKEN})
    data = json.loads(data.content.decode('utf-8'))

    if len(data) == 0: return data
    
    # get locations
    locations = []
    if len(data) > 1:
        for l in data:
            locations.append(l["locations"])
    
    return locations


@app.get("/get-geolocation/{location}")
async def get_geolocation(location: str):
    """
    Returns latitud and longitude of a location. The JSON coming from the position stack API has this structure:
    {
    "data": [
        {
        "latitude": 37.790749,
        "longitude": -122.389354,
        "type": "venue",
        "name": "Epic Roasthouse",
        "number": "369",
        "postal_code": null,
        "street": "The Embarcadero",
        "confidence": 1,
        "region": "California",
        "region_code": "CA",
        "county": "San Francisco County",
        "locality": "San Francisco",
        "administrative_area": null,
        "neighbourhood": "Rincon Hill",
        "country": "United States",
        "country_code": "USA",
        "continent": "North America",
        "label": "Epic Roasthouse, San Francisco, CA, USA"
        }
    ]
    }
    For the purpose of this endpoint, we only need latitude and longitude
    """
    data = requests.get(f"http://api.positionstack.com/v1/forward?access_key={config.POSITION_STACK_API_KEY}& query={location}")
    data = json.loads(data.content.decode('utf-8'))
    if len(data["data"]) == 0: 
        return json.dumps([])
    else:
        return json.dumps({"lat": data["data"][0]["latitude"], "lng": data["data"][0]["longitude"]})

@app.post("/get-geolocations/")
async def get_geolocation(data: AddressesList):
    geolocations = []
    for addr in data.addresses:
        response = requests.get(f"http://api.positionstack.com/v1/forward?access_key={config.POSITION_STACK_API_KEY}& query={addr}")
        response = json.loads(response.content.decode('utf-8'))
        if len(response["data"]) == 0: 
            pass
        else:
            geolocations.append({"lat": response["data"][0]["latitude"], "lng": response["data"][0]["longitude"]})
    return geolocations