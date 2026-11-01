import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Store,
  Home,
  Navigation,
  Clock,
  Milestone,
  Route as RouteIcon,
} from "lucide-react";
import { reverseGeocode } from "../services/api";


// Fix default Leaflet icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Restaurant Marker Icon (Zomato Red)
const restaurantDivIcon = L.divIcon({
  className: "custom-restaurant-pin",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
      <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(226, 55, 68, 0.2); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 36px; height: 36px; border-radius: 9999px; background: #E23744; border: 3px solid white; box-shadow: 0 4px 14px rgba(226, 55, 68, 0.4); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path>
          <path d="M12 2v20"></path>
          <path d="m15 15 3 7"></path>
          <path d="M6 2v7"></path>
          <path d="M6 9a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2"></path>
        </svg>
      </div>
      <div style="position: absolute; bottom: -4px; width: 8px; height: 8px; background: #E23744; transform: rotate(45deg); border-right: 1px solid white; border-bottom: 1px solid white;"></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 42],
  popupAnchor: [0, -40],
});

// Custom Delivery Destination Marker Icon (Emerald Green)
const deliveryDivIcon = L.divIcon({
  className: "custom-delivery-pin",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
      <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 36px; height: 36px; border-radius: 9999px; background: #10B981; border: 3px solid white; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
      <div style="position: absolute; bottom: -4px; width: 8px; height: 8px; background: #10B981; transform: rotate(45deg); border-right: 1px solid white; border-bottom: 1px solid white;"></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 42],
  popupAnchor: [0, -40],
});

// Component to handle auto-fitting bounds when locations change
function MapBoundsController({ restaurantPos, deliveryPos, routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (
      !restaurantPos ||
      !deliveryPos ||
      isNaN(restaurantPos[0]) ||
      isNaN(deliveryPos[0])
    ) {
      return;
    }

    try {
      const bounds = L.latLngBounds([restaurantPos, deliveryPos]);
      if (routeCoordinates && routeCoordinates.length > 0) {
        routeCoordinates.forEach((pt) => bounds.extend(pt));
      }
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
        animate: true,
      });
    } catch (e) {
      console.warn("Failed to fit map bounds:", e);
    }
  }, [map, restaurantPos, deliveryPos, routeCoordinates]);

  return null;
}

export default function InteractiveMap({
  restaurant,
  delivery,
  route,
  loadingRoute,
  onUpdateRestaurant,
  onUpdateDelivery,
}) {
  const hasRestaurant =
    restaurant?.latitude &&
    restaurant?.longitude &&
    !isNaN(restaurant.latitude) &&
    !isNaN(restaurant.longitude);

  const hasDelivery =
    delivery?.latitude &&
    delivery?.longitude &&
    !isNaN(delivery.latitude) &&
    !isNaN(delivery.longitude);

  const restaurantPos = hasRestaurant
    ? [Number(restaurant.latitude), Number(restaurant.longitude)]
    : [22.5726, 88.3639];

  const deliveryPos = hasDelivery
    ? [Number(delivery.latitude), Number(delivery.longitude)]
    : [22.5958, 88.4029];

  const centerPos = [
    (restaurantPos[0] + deliveryPos[0]) / 2,
    (restaurantPos[1] + deliveryPos[1]) / 2,
  ];

  // Drag handlers for interactive repositioning on map
  const restaurantEventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker && onUpdateRestaurant) {
          const latLng = marker.getLatLng();
          const lat = Number(latLng.lat.toFixed(6));
          const lon = Number(latLng.lng.toFixed(6));
          reverseGeocode(lat, lon).then((rev) => {
            onUpdateRestaurant({
              name: rev?.name || `Restaurant (${lat}, ${lon})`,
              address: rev?.fullAddress || `${lat}, ${lon}`,
              latitude: lat,
              longitude: lon,
              verified: true,
            });
          });
        }
      },
    }),
    [onUpdateRestaurant]
  );

  const deliveryEventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker && onUpdateDelivery) {
          const latLng = marker.getLatLng();
          const lat = Number(latLng.lat.toFixed(6));
          const lon = Number(latLng.lng.toFixed(6));
          reverseGeocode(lat, lon).then((rev) => {
            onUpdateDelivery({
              name: rev?.name || `Delivery (${lat}, ${lon})`,
              address: rev?.fullAddress || `${lat}, ${lon}`,
              latitude: lat,
              longitude: lon,
              verified: true,
            });
          });
        }
      },
    }),
    [onUpdateDelivery]
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E23744] flex items-center justify-center font-bold">
            <RouteIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Interactive Delivery Route Map
            </h2>
            <p className="text-xs text-gray-500">
              Drag pins or enter addresses to recalculate road route & distance
            </p>
          </div>
        </div>

        {/* Route Status Badge */}
        {route?.distanceKm && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#E23744] rounded-full text-xs font-semibold border border-red-100">
            <Milestone className="w-3.5 h-3.5" />
            <span>{route.distanceKm} km</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-gray-200/80 shadow-inner">
        {loadingRoute && (
          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-gray-700 flex items-center gap-2 border border-gray-100">
            <div className="w-3 h-3 rounded-full border-2 border-[#E23744] border-t-transparent animate-spin" />
            <span>Calculating road route...</span>
          </div>
        )}

        <MapContainer
          center={centerPos}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hasRestaurant && (
            <Marker
              position={restaurantPos}
              icon={restaurantDivIcon}
              draggable={Boolean(onUpdateRestaurant)}
              eventHandlers={restaurantEventHandlers}
            >
              <Popup className="custom-popup">
                <div className="text-xs p-1">
                  <p className="font-bold text-[#E23744] flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" /> {restaurant.name}
                  </p>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    {restaurant.address}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    {restaurantPos[0].toFixed(4)}, {restaurantPos[1].toFixed(4)}
                  </p>
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    💡 Drag pin to move pickup location
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {hasDelivery && (
            <Marker
              position={deliveryPos}
              icon={deliveryDivIcon}
              draggable={Boolean(onUpdateDelivery)}
              eventHandlers={deliveryEventHandlers}
            >
              <Popup className="custom-popup">
                <div className="text-xs p-1">
                  <p className="font-bold text-emerald-700 flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" /> Customer Location
                  </p>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    {delivery.address}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    {deliveryPos[0].toFixed(4)}, {deliveryPos[1].toFixed(4)}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    💡 Drag pin to move delivery location
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Real road route polyline */}
          {route?.coordinates && route.coordinates.length > 0 && (
            <>
              {/* Outer glow line */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#E23744",
                  weight: 8,
                  opacity: 0.25,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Main solid route line */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#E23744",
                  weight: 4.5,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </>
          )}

          <MapBoundsController
            restaurantPos={restaurantPos}
            deliveryPos={deliveryPos}
            routeCoordinates={route?.coordinates}
          />
        </MapContainer>
      </div>

      {/* ==================================================== */}
      {/* Location Information Card Below Map */}
      {/* ==================================================== */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Restaurant Point */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-lg bg-red-100 text-[#E23744] flex items-center justify-center text-xs font-bold">
              A
            </span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Restaurant
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-900 truncate" title={restaurant.name}>
            {restaurant.name || "Select restaurant"}
          </p>
          <p className="text-[11px] text-gray-500 truncate" title={restaurant.address}>
            {restaurant.address || "Pending location selection"}
          </p>
        </div>

        {/* Delivery Point */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              B
            </span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Delivery Address
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-900 truncate" title={delivery.address}>
            {delivery.address || "Select delivery location"}
          </p>
          <p className="text-[11px] text-gray-500">
            Coordinates: {Number(delivery.latitude).toFixed(3)},{" "}
            {Number(delivery.longitude).toFixed(3)}
          </p>
        </div>

        {/* Road Distance */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#E23744]" />
            Road Distance
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-gray-900">
              {route?.distanceKm || "--"}
            </span>
            <span className="text-xs text-gray-500 font-semibold">km</span>
          </div>
          <span className="text-[10px] text-gray-400">
            {route?.isRealRoad
              ? "✓ OSRM Road Geometry"
              : "Direct Haversine Estimate"}
          </span>
        </div>

        {/* Driving Transit Time */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Driving Transit
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-gray-900">
              ~{route?.durationMin || "--"}
            </span>
            <span className="text-xs text-gray-500 font-semibold">mins</span>
          </div>
          <span className="text-[10px] text-gray-400">
            Pure road transit without prep time
          </span>
        </div>
      </div>
    </div>
  );
}
