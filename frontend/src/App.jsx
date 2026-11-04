import React, { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import LocationPicker from "./components/LocationPicker";
import InteractiveMap from "./components/InteractiveMap";
import DeliveryForm from "./components/DeliveryForm";
import PredictionResult from "./components/PredictionResult";
import Footer from "./components/Footer";
import {
  checkBackendHealth,
  predictDeliveryTime,
  fetchRoute,
} from "./services/api";
import { validateFormData } from "./utils/validation";
import { DEMO_PRESETS } from "./utils/presets";
import { Utensils, ShieldCheck, Flame } from "lucide-react";
import "./App.css";


const DEFAULT_RESTAURANT = {
  name: "Arsalan Restaurant, Park Street",
  address: "136, Park Street, Beniapukur, Kolkata, West Bengal",
  latitude: 22.5448,
  longitude: 88.3619,
  verified: true,
};

const DEFAULT_DELIVERY = {
  name: "Salt Lake Sector V Tech Hub",
  address: "Sector V, Bidhannagar, Kolkata, West Bengal",
  latitude: 22.5802,
  longitude: 88.4357,
  verified: true,
};

const DEFAULT_FORM_DATA = {
  delivery_person_age: 28,
  delivery_person_ratings: 4.8,
  weather_conditions: "Cloudy",
  road_traffic_density: "High",
  vehicle_condition: 2,
  type_of_order: "Meal",
  type_of_vehicle: "motorcycle",
  multiple_deliveries: 1,
  festival: "No",
  city: "Metropolitian",
  order_hour: 20,
  order_minute: 15,
  picked_hour: 20,
  picked_minute: 25,
  order_day: 15,
  order_month: 3,
  order_dayofweek: 5,
};

export default function App() {
  const [restaurant, setRestaurant] = useState(DEFAULT_RESTAURANT);
  const [delivery, setDelivery] = useState(DEFAULT_DELIVERY);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Synchronize full data structure for validation
  const fullValidationPayload = useMemo(() => {
    return {
      ...formData,
      restaurant_latitude: restaurant.latitude,
      restaurant_longitude: restaurant.longitude,
      delivery_location_latitude: delivery.latitude,
      delivery_location_longitude: delivery.longitude,
    };
  }, [formData, restaurant, delivery]);

  // Real-time Zod validation
  const validationResult = useMemo(() => {
    return validateFormData(fullValidationPayload);
  }, [fullValidationPayload]);

  // Check backend health on initial mount
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      const res = await checkBackendHealth();
      if (isMounted) {
        setBackendOnline(res.ok);
        if (res.ok) {
          toast.success("Connected to FastAPI ML Backend", {
            id: "backend-status",
            duration: 3000,
          });
        }
      }
    }
    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch OSRM road route whenever coordinates change
  useEffect(() => {
    if (
      !restaurant.latitude ||
      !restaurant.longitude ||
      !delivery.latitude ||
      !delivery.longitude
    ) {
      return;
    }

    let isSubscribed = true;
    const timer = setTimeout(async () => {
      setLoadingRoute(true);
      const res = await fetchRoute(
        restaurant.latitude,
        restaurant.longitude,
        delivery.latitude,
        delivery.longitude
      );
      if (isSubscribed) {
        setRoute(res);
        setLoadingRoute(false);
      }
    }, 400);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [
    restaurant.latitude,
    restaurant.longitude,
    delivery.latitude,
    delivery.longitude,
  ]);

  // Form field change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Swap restaurant and delivery
  const handleSwapLocations = () => {
    const temp = { ...restaurant };
    setRestaurant({ ...delivery });
    setDelivery(temp);
    toast.success("Swapped pickup & delivery locations", { duration: 2000 });
  };

  // Select demo preset
  const handleSelectPreset = (preset) => {
    setRestaurant({ ...preset.restaurant, verified: true });
    setDelivery({ ...preset.delivery, verified: true });
    setFormData((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    setPrediction(null);
    toast.success(`Loaded demo: ${preset.name}`, { duration: 3000 });
  };

  // Reset to initial clean state
  const handleReset = () => {
    setRestaurant(DEFAULT_RESTAURANT);
    setDelivery(DEFAULT_DELIVERY);
    setFormData(DEFAULT_FORM_DATA);
    setPrediction(null);
    toast("Reset form to default state", { icon: "🔄", duration: 2500 });
  };

  // Sync with current live clock
  const handleSyncCurrentTime = () => {
    const now = new Date();
    const orderH = now.getHours();
    const orderM = now.getMinutes();

    // Standard 15-minute kitchen prep time offset
    const prepDate = new Date(now.getTime() + 15 * 60000);
    const pickH = prepDate.getHours();
    const pickM = prepDate.getMinutes();

    // Convert JS getDay() (0=Sun, 1=Mon...6=Sat) to Model encoding (0=Mon...6=Sun)
    const jsDay = now.getDay();
    const modelDayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    setFormData((prev) => ({
      ...prev,
      order_hour: orderH,
      order_minute: orderM,
      picked_hour: pickH,
      picked_minute: pickM,
      order_day: now.getDate(),
      order_month: now.getMonth() + 1,
      order_dayofweek: modelDayOfWeek,
    }));

    toast.success("Synced with live clock (+15m kitchen prep)", {
      icon: "⏱️",
      duration: 3000,
    });
  };

  // Submit prediction to FastAPI backend
  const handleSubmitPrediction = async (e) => {
    e.preventDefault();

    if (!validationResult.isValid) {
      toast.error("Please resolve highlighted validation errors before submitting.");
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    setLoading(true);
    setPrediction(null);

    try {
      const payload = {
        ...validationResult.parsedData,
        // Ensure exact numeric types as expected by FastAPI Pydantic schema
        delivery_person_age: Number(validationResult.parsedData.delivery_person_age),
        delivery_person_ratings: Number(
          validationResult.parsedData.delivery_person_ratings
        ),
        restaurant_latitude: Number(
          validationResult.parsedData.restaurant_latitude
        ),
        restaurant_longitude: Number(
          validationResult.parsedData.restaurant_longitude
        ),
        delivery_location_latitude: Number(
          validationResult.parsedData.delivery_location_latitude
        ),
        delivery_location_longitude: Number(
          validationResult.parsedData.delivery_location_longitude
        ),
        vehicle_condition: Number(validationResult.parsedData.vehicle_condition),
        multiple_deliveries: Number(
          validationResult.parsedData.multiple_deliveries
        ),
        order_hour: Number(validationResult.parsedData.order_hour),
        order_minute: Number(validationResult.parsedData.order_minute),
        picked_hour: Number(validationResult.parsedData.picked_hour),
        picked_minute: Number(validationResult.parsedData.picked_minute),
        order_day: Number(validationResult.parsedData.order_day),
        order_month: Number(validationResult.parsedData.order_month),
        order_dayofweek: Number(validationResult.parsedData.order_dayofweek),
      };

      const result = await predictDeliveryTime(payload);
      setPrediction(result);

      toast.success(
        `Predicted: ${result.predicted_delivery_time} mins for ${result.distance_km} km!`,
        { duration: 4500, icon: "🚴" }
      );

      // Scroll to prediction result on smaller devices
      const resultElem = document.getElementById("prediction-result-card");
      if (resultElem) {
        resultElem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      console.error("Prediction failed:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to predict delivery time. Check backend connection.";
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#FFFFFF",
            color: "#1F2937",
            borderRadius: "1rem",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            border: "1px solid #F3F4F6",
            fontSize: "13px",
            fontWeight: 600,
          },
          success: {
            iconTheme: {
              primary: "#E23744",
              secondary: "#FFFFFF",
            },
          },
        }}
      />

      {/* Top Navbar */}
      <Navbar
        backendOnline={backendOnline}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        loading={loading}
      />

      {/* Hero Header Banner */}
      <div className="bg-white border-b border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-[#E23744] border border-red-100 inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-[#E23744]" />
                {/* Zomato-Inspired Precision Engine */}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-medium">
                Live Road Geometries + Machine Learning
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Predict Food Delivery Time
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              Select verified restaurant & delivery locations to visualize the actual
              road route, configure transit conditions, and forecast arrival times.
            </p>
          </div>

          {/* Quick Demo Preset Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
              Try:
            </span>
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-[#E23744] border border-gray-200 hover:border-red-200 transition-all active:scale-95 cursor-pointer"
              >
                {p.name.split("•")[0].trim()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==================================================== */}
          {/* Left Column: Form & Location Selection (7 cols) */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* Smart Location Selection */}
            <LocationPicker
              restaurant={restaurant}
              delivery={delivery}
              onUpdateRestaurant={setRestaurant}
              onUpdateDelivery={setDelivery}
              onSwapLocations={handleSwapLocations}
              errors={validationResult.errors}
            />

            {/* Delivery Parameters Form */}
            <DeliveryForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmitPrediction}
              loading={loading}
              errors={validationResult.errors}
              isFormValid={validationResult.isValid}
              onSyncCurrentTime={handleSyncCurrentTime}
            />
          </div>

          {/* ==================================================== */}
          {/* Right Column: Live Interactive Map & Results (5 cols) */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Interactive Leaflet Map */}
            <InteractiveMap
              restaurant={restaurant}
              delivery={delivery}
              route={route}
              loadingRoute={loadingRoute}
              onUpdateRestaurant={setRestaurant}
              onUpdateDelivery={setDelivery}
            />

            {/* Prediction Result Section */}
            <div id="prediction-result-card">
              {prediction ? (
                <PredictionResult
                  prediction={prediction}
                  formData={formData}
                  route={route}
                />
              ) : (
                /* Empty state before prediction */
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E23744] flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Utensils className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Ready to Calculate ETA
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                    Verify locations on the map, customize transit parameters,
                    and click Predict Delivery Time.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    RandomForest ML Pipeline Ready
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <Footer />
    </div>
  );
}