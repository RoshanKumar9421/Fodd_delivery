from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib
import traceback


# =========================================================
# LOAD MODEL
# =========================================================

from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

MODEL_PATH = BASE_DIR / "food_delivery_best_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully")

    if hasattr(model, "feature_names_in_"):
        print("\nModel expects these features:")
        print(model.feature_names_in_)

except Exception as e:
    print("❌ Model loading failed:")
    print(e)
    raise


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Food Delivery Time Prediction API",
    description="Predict food delivery time using Machine Learning",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class DeliveryRequest(BaseModel):

    delivery_person_age: float = Field(..., ge=18, le=70)

    delivery_person_ratings: float = Field(
        ...,
        ge=1,
        le=5
    )

    restaurant_latitude: float
    restaurant_longitude: float

    delivery_location_latitude: float
    delivery_location_longitude: float

    weather_conditions: str
    road_traffic_density: str

    vehicle_condition: int

    type_of_order: str = Field(
        default="Meal",
        description="Type of order (Meal, Snack, Drinks, Buffet)"
    )

    type_of_vehicle: str

    multiple_deliveries: float

    festival: str

    city: str

    order_hour: int = Field(
        ...,
        ge=0,
        le=23
    )

    order_minute: int = Field(
        ...,
        ge=0,
        le=59
    )

    picked_hour: int = Field(
        ...,
        ge=0,
        le=23
    )

    picked_minute: int = Field(
        ...,
        ge=0,
        le=59
    )

    order_day: int = Field(
        ...,
        ge=1,
        le=31
    )

    order_month: int = Field(
        ...,
        ge=1,
        le=12
    )

    order_dayofweek: int = Field(
        ...,
        ge=0,
        le=6
    )


# =========================================================
# DISTANCE CALCULATION
# =========================================================

def calculate_distance(
    restaurant_latitude,
    restaurant_longitude,
    delivery_latitude,
    delivery_longitude
):

    R = 6371.0

    lat1 = np.radians(restaurant_latitude)
    lat2 = np.radians(delivery_latitude)

    dlat = np.radians(
        delivery_latitude - restaurant_latitude
    )

    dlon = np.radians(
        delivery_longitude - restaurant_longitude
    )

    a = (
        np.sin(dlat / 2) ** 2
        +
        np.cos(lat1)
        * np.cos(lat2)
        * np.sin(dlon / 2) ** 2
    )

    a = np.clip(a, 0.0, 1.0)

    distance = (
        2
        * R
        * np.arcsin(np.sqrt(a))
    )

    return float(distance)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Food Delivery Time Prediction API",
        "status": "running"
    }


# =========================================================
# PREDICT
# =========================================================

@app.post("/predict")
def predict_delivery_time(data: DeliveryRequest):

    try:

        # -------------------------------------------------
        # Distance
        # -------------------------------------------------

        distance = calculate_distance(
            data.restaurant_latitude,
            data.restaurant_longitude,
            data.delivery_location_latitude,
            data.delivery_location_longitude
        )


        # -------------------------------------------------
        # Pickup delay
        # -------------------------------------------------

        order_total_minutes = (
            data.order_hour * 60
            + data.order_minute
        )

        picked_total_minutes = (
            data.picked_hour * 60
            + data.picked_minute
        )

        pickup_delay = (
            picked_total_minutes
            - order_total_minutes
        )

        if pickup_delay < 0:
            pickup_delay += 1440


        # -------------------------------------------------
        # Standardize categorical values for model
        # -------------------------------------------------

        raw_weather = data.weather_conditions.strip()
        if raw_weather.lower().startswith("conditions "):
            raw_weather = raw_weather[11:].strip()
        weather_formatted = f"conditions {raw_weather.capitalize()}"

        traffic_formatted = data.road_traffic_density.strip().capitalize()
        order_type_formatted = data.type_of_order.strip().capitalize()
        vehicle_formatted = data.type_of_vehicle.strip().lower()
        festival_formatted = data.festival.strip().capitalize()

        city_raw = data.city.strip()
        if city_raw.lower() in ["metropolitan", "metropolitian"]:
            city_formatted = "Metropolitian"
        elif city_raw.lower() in ["semi-urban", "semi_urban", "semiurban"]:
            city_formatted = "Semi-Urban"
        elif city_raw.lower() == "urban":
            city_formatted = "Urban"
        else:
            city_formatted = city_raw

        # -------------------------------------------------
        # Input DataFrame
        # -------------------------------------------------

        input_data = pd.DataFrame([{

            "Delivery_person_Age":
                data.delivery_person_age,

            "Delivery_person_Ratings":
                data.delivery_person_ratings,

            "Restaurant_latitude":
                data.restaurant_latitude,

            "Restaurant_longitude":
                data.restaurant_longitude,

            "Delivery_location_latitude":
                data.delivery_location_latitude,

            "Delivery_location_longitude":
                data.delivery_location_longitude,

            "Weatherconditions":
                weather_formatted,

            "Road_traffic_density":
                traffic_formatted,

            "Vehicle_condition":
                data.vehicle_condition,

            "Type_of_order":
                order_type_formatted,

            "Type_of_vehicle":
                vehicle_formatted,

            "multiple_deliveries":
                data.multiple_deliveries,

            "Festival":
                festival_formatted,

            "City":
                city_formatted,

            "Order_day":
                data.order_day,

            "Order_month":
                data.order_month,

            "Order_dayofweek":
                data.order_dayofweek,

            "Order_hour":
                data.order_hour,

            "Order_minute":
                data.order_minute,

            "Picked_hour":
                data.picked_hour,

            "Picked_minute":
                data.picked_minute,

            "Pickup_delay_min":
                pickup_delay,

            "Distance_km":
                distance
        }])


        # -------------------------------------------------
        # PRINT INPUT FOR DEBUGGING
        # -------------------------------------------------

        print("\n================ INPUT ================")

        print(input_data)

        print("\nInput columns:")

        print(input_data.columns.tolist())


        # -------------------------------------------------
        # MODEL FEATURES
        # -------------------------------------------------

        if hasattr(model, "feature_names_in_"):

            expected_features = list(
                model.feature_names_in_
            )

            print("\nExpected features:")

            print(expected_features)

            print("\nMissing features:")

            print(
                set(expected_features)
                - set(input_data.columns)
            )

            print("\nExtra features:")

            print(
                set(input_data.columns)
                - set(expected_features)
            )

            # Reorder columns exactly like training
            input_data = input_data[
                expected_features
            ]


        # -------------------------------------------------
        # PREDICTION
        # -------------------------------------------------

        prediction = model.predict(
            input_data
        )

        delivery_time = float(
            prediction[0]
        )

        delivery_time = max(
            0,
            delivery_time
        )


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success": True,

            "predicted_delivery_time":
                round(
                    delivery_time,
                    2
                ),

            "unit": "minutes",

            "distance_km":
                round(
                    distance,
                    2
                ),

            "pickup_delay_min":
                round(
                    pickup_delay,
                    2
                )
        }


    except Exception as e:

        print("\n❌ PREDICTION ERROR")

        print(
            traceback.format_exc()
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)