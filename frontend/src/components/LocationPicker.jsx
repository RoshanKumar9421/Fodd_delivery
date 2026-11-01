import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Store,
  Home,
  Search,
  Loader2,
  CheckCircle2,
  ArrowUpDown,
  Navigation,
  SlidersHorizontal,
  CornerDownLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  searchAddress,
  geocodeManualAddress,
  reverseGeocode,
} from "../services/api";

export default function LocationPicker({
  restaurant,
  delivery,
  onUpdateRestaurant,
  onUpdateDelivery,
  onSwapLocations,
  errors = {},
}) {
  // Search state for restaurant
  const [restQuery, setRestQuery] = useState(restaurant.name || "");
  const [restSuggestions, setRestSuggestions] = useState([]);
  const [restSearching, setRestSearching] = useState(false);
  const [showRestDropdown, setShowRestDropdown] = useState(false);
  const [showRestCoordEdit, setShowRestCoordEdit] = useState(false);
  const [restLatInput, setRestLatInput] = useState(restaurant.latitude || "");
  const [restLonInput, setRestLonInput] = useState(restaurant.longitude || "");

  // Search state for delivery
  const [delQuery, setDelQuery] = useState(delivery.address || "");
  const [delSuggestions, setDelSuggestions] = useState([]);
  const [delSearching, setDelSearching] = useState(false);
  const [showDelDropdown, setShowDelDropdown] = useState(false);
  const [showDelCoordEdit, setShowDelCoordEdit] = useState(false);
  const [delLatInput, setDelLatInput] = useState(delivery.latitude || "");
  const [delLonInput, setDelLonInput] = useState(delivery.longitude || "");

  const restDropdownRef = useRef(null);
  const delDropdownRef = useRef(null);

  // Sync internal search input when parent updates (e.g. preset selection or external update)
  useEffect(() => {
    const t = setTimeout(() => {
      setRestQuery(restaurant.name || "");
      setRestLatInput(restaurant.latitude || "");
      setRestLonInput(restaurant.longitude || "");
    }, 0);
    return () => clearTimeout(t);
  }, [restaurant.name, restaurant.latitude, restaurant.longitude]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDelQuery(delivery.address || "");
      setDelLatInput(delivery.latitude || "");
      setDelLonInput(delivery.longitude || "");
    }, 0);
    return () => clearTimeout(t);
  }, [delivery.address, delivery.latitude, delivery.longitude]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        restDropdownRef.current &&
        !restDropdownRef.current.contains(event.target)
      ) {
        setShowRestDropdown(false);
      }
      if (
        delDropdownRef.current &&
        !delDropdownRef.current.contains(event.target)
      ) {
        setShowDelDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for Restaurant suggestions
  useEffect(() => {
    if (!restQuery || restQuery.length < 2 || restQuery === restaurant.name) {
      const t = setTimeout(() => setRestSuggestions([]), 0);
      return () => clearTimeout(t);
    }

    const timer = setTimeout(async () => {
      setRestSearching(true);
      const results = await searchAddress(restQuery);
      setRestSuggestions(results);
      setRestSearching(false);
      setShowRestDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [restQuery, restaurant.name]);

  // Debounced search for Delivery Address suggestions
  useEffect(() => {
    if (!delQuery || delQuery.length < 2 || delQuery === delivery.address) {
      const t = setTimeout(() => setDelSuggestions([]), 0);
      return () => clearTimeout(t);
    }

    const timer = setTimeout(async () => {
      setDelSearching(true);
      const results = await searchAddress(delQuery);
      setDelSuggestions(results);
      setDelSearching(false);
      setShowDelDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [delQuery, delivery.address]);

  // Handle selection from dropdown
  const selectRestaurantSuggestion = (item) => {
    setRestQuery(item.name);
    setShowRestDropdown(false);
    onUpdateRestaurant({
      name: item.name,
      address: item.fullAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      verified: true,
    });
    toast.success(`Restaurant location set: ${item.name}`, {
      id: "rest-loc",
      icon: "📍",
      duration: 2500,
    });
  };

  const selectDeliverySuggestion = (item) => {
    setDelQuery(item.fullAddress);
    setShowDelDropdown(false);
    onUpdateDelivery({
      name: item.name,
      address: item.fullAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      verified: true,
    });
    toast.success(`Delivery location set: ${item.name}`, {
      id: "del-loc",
      icon: "🏠",
      duration: 2500,
    });
  };

  // Resolve manual address for Restaurant
  const resolveManualRestaurant = async (customQuery = null) => {
    const query = (customQuery !== null ? customQuery : restQuery).trim();
    if (!query) return;

    setRestSearching(true);
    setShowRestDropdown(false);
    try {
      const res = await geocodeManualAddress(query);
      if (res.ok && res.data) {
        setRestQuery(query);
        onUpdateRestaurant({
          name: res.data.name,
          address: res.data.fullAddress || query,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          verified: true,
        });
        const note = res.data.city ? ` in ${res.data.city}` : "";
        toast.success(`Restaurant location verified${note}!`, {
          id: "rest-manual-found",
          icon: "📍",
          duration: 3500,
        });
      } else {
        toast.error(
          res.error ||
            `Could not locate "${query}". Please check spelling or enter coordinates.`,
          { id: "rest-manual-err", duration: 4000 }
        );
      }
    } catch (err) {
      toast.error(`Error resolving location: ${err.message}`);
    } finally {
      setRestSearching(false);
    }
  };

  // Resolve manual address for Delivery
  const resolveManualDelivery = async (customQuery = null) => {
    const query = (customQuery !== null ? customQuery : delQuery).trim();
    if (!query) return;

    setDelSearching(true);
    setShowDelDropdown(false);
    try {
      const res = await geocodeManualAddress(query);
      if (res.ok && res.data) {
        setDelQuery(query);
        onUpdateDelivery({
          name: res.data.name,
          address: res.data.fullAddress || query,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          verified: true,
        });
        const note = res.data.city ? ` in ${res.data.city}` : "";
        toast.success(`Delivery destination verified${note}!`, {
          id: "del-manual-found",
          icon: "🏠",
          duration: 3500,
        });
      } else {
        toast.error(
          res.error ||
            `Could not locate "${query}". Please check spelling or enter coordinates.`,
          { id: "del-manual-err", duration: 4000 }
        );
      }
    } catch (err) {
      toast.error(`Error resolving location: ${err.message}`);
    } finally {
      setDelSearching(false);
    }
  };

  // Apply numerical coordinates for Restaurant
  const handleApplyRestCoords = async () => {
    const lat = parseFloat(restLatInput);
    const lon = parseFloat(restLonInput);
    if (
      isNaN(lat) ||
      lat < -90 ||
      lat > 90 ||
      isNaN(lon) ||
      lon < -180 ||
      lon > 180
    ) {
      toast.error(
        "Please enter valid coordinates (Latitude -90 to 90, Longitude -180 to 180)"
      );
      return;
    }
    const rev = await reverseGeocode(lat, lon);
    onUpdateRestaurant({
      name: rev.name,
      address: rev.fullAddress,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lon.toFixed(6)),
      verified: true,
    });
    setRestQuery(rev.name);
    setShowRestCoordEdit(false);
    toast.success("Applied restaurant coordinates", { icon: "✓" });
  };

  // Apply numerical coordinates for Delivery
  const handleApplyDelCoords = async () => {
    const lat = parseFloat(delLatInput);
    const lon = parseFloat(delLonInput);
    if (
      isNaN(lat) ||
      lat < -90 ||
      lat > 90 ||
      isNaN(lon) ||
      lon < -180 ||
      lon > 180
    ) {
      toast.error(
        "Please enter valid coordinates (Latitude -90 to 90, Longitude -180 to 180)"
      );
      return;
    }
    const rev = await reverseGeocode(lat, lon);
    onUpdateDelivery({
      name: rev.name,
      address: rev.fullAddress,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lon.toFixed(6)),
      verified: true,
    });
    setDelQuery(rev.fullAddress || rev.name);
    setShowDelCoordEdit(false);
    toast.success("Applied delivery coordinates", { icon: "✓" });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E23744] flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Location Selection
            </h2>
            <p className="text-xs text-gray-500">
              Type any address/coordinates or pick from suggestions
            </p>
          </div>
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={onSwapLocations}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-[#E23744] hover:bg-red-50 border border-gray-200 transition-all active:scale-95 cursor-pointer"
          title="Swap Restaurant and Delivery locations"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Swap</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* ==================================================== */}
        {/* A. Restaurant Location */}
        {/* ==================================================== */}
        <div className="relative" ref={restDropdownRef}>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#E23744]" />
              Restaurant Location (Pickup)
            </span>
            {restSearching ? (
              <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating
                address...
              </span>
            ) : restaurant.verified ? (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Location
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                <CornerDownLeft className="w-3.5 h-3.5" /> Press Enter or click
                Locate
              </span>
            )}
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {restSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#E23744]" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>

            <input
              type="text"
              value={restQuery}
              onChange={(e) => {
                setRestQuery(e.target.value);
                if (restaurant.verified) {
                  onUpdateRestaurant({ ...restaurant, verified: false });
                }
              }}
              onFocus={() => {
                if (restSuggestions.length > 0 || restQuery.trim().length >= 2) {
                  setShowRestDropdown(true);
                }
              }}
              onBlur={(e) => {
                // If blur went to dropdown item or locate button, skip auto-resolve
                if (
                  restDropdownRef.current &&
                  restDropdownRef.current.contains(e.relatedTarget)
                ) {
                  return;
                }
                setShowRestDropdown(false);
                if (
                  restQuery &&
                  restQuery.trim().length >= 2 &&
                  (!restaurant.verified ||
                    restQuery.trim() !== restaurant.name)
                ) {
                  resolveManualRestaurant();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  resolveManualRestaurant();
                }
              }}
              placeholder="Type restaurant name, manual address, or coordinates..."
              className={`w-full pl-10 pr-24 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-3 transition-all ${
                errors.restaurant_latitude || errors.restaurant_longitude
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#E23744] focus:ring-red-100"
              }`}
            />

            {/* Quick Locate Button */}
            <button
              type="button"
              onClick={() => resolveManualRestaurant()}
              disabled={restSearching || !restQuery.trim()}
              className="absolute inset-y-1.5 right-1.5 px-3 rounded-xl bg-[#E23744] hover:bg-red-600 active:scale-95 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              title="Locate manually entered address or coordinates"
            >
              {restSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Locate</span>
                </>
              )}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showRestDropdown &&
            (restSuggestions.length > 0 ||
              (restQuery && restQuery.trim().length >= 2)) && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-40 max-h-64 overflow-y-auto">
                {/* Top option: Use exact typed text */}
                {restQuery && restQuery.trim().length >= 2 && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      resolveManualRestaurant(restQuery);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-red-50/60 hover:bg-red-100/80 border border-red-100 transition-colors flex items-center gap-2.5 group mb-1 cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-[#E23744] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#E23744] truncate">
                        Use manual entry: &ldquo;{restQuery}&rdquo;
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Geocode this exact text without picking a suggestion
                      </p>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E23744]" />
                  </button>
                )}

                {/* Suggestions list */}
                {restSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectRestaurantSuggestion(item);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#E23744] mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 group-hover:text-[#E23744] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {item.fullAddress}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

          {/* Coordinate Pill & Manual Coordinate Editor */}
          {showRestCoordEdit ? (
            <div className="mt-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-end gap-2.5">
              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={restLatInput}
                  onChange={(e) => setRestLatInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#E23744]"
                  placeholder="-90 to 90"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={restLonInput}
                  onChange={(e) => setRestLonInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#E23744]"
                  placeholder="-180 to 180"
                />
              </div>
              <div className="flex items-center gap-1.5 pb-0.5">
                <button
                  type="button"
                  onClick={handleApplyRestCoords}
                  className="px-3 py-1.5 bg-[#E23744] text-white text-xs font-semibold rounded-lg hover:bg-red-600 active:scale-95 cursor-pointer transition-all"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setShowRestCoordEdit(false)}
                  className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className="text-gray-500 font-medium truncate max-w-xs"
                title={restaurant.address}
              >
                📍 {restaurant.address || "Address will appear after selection"}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-[11px] font-mono text-gray-600">
                  Lat: {Number(restaurant.latitude).toFixed(4)}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-[11px] font-mono text-gray-600">
                  Lon: {Number(restaurant.longitude).toFixed(4)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRestLatInput(restaurant.latitude);
                    setRestLonInput(restaurant.longitude);
                    setShowRestCoordEdit(true);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  title="Edit exact coordinates manually"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* B. Delivery Location */}
        {/* ==================================================== */}
        <div className="relative" ref={delDropdownRef}>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              Delivery Location (Destination)
            </span>
            {delSearching ? (
              <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating
                address...
              </span>
            ) : delivery.verified ? (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Location
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                <CornerDownLeft className="w-3.5 h-3.5" /> Press Enter or click
                Locate
              </span>
            )}
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {delSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>

            <input
              type="text"
              value={delQuery}
              onChange={(e) => {
                setDelQuery(e.target.value);
                if (delivery.verified) {
                  onUpdateDelivery({ ...delivery, verified: false });
                }
              }}
              onFocus={() => {
                if (delSuggestions.length > 0 || delQuery.trim().length >= 2) {
                  setShowDelDropdown(true);
                }
              }}
              onBlur={(e) => {
                // If blur went to dropdown item or locate button, skip auto-resolve
                if (
                  delDropdownRef.current &&
                  delDropdownRef.current.contains(e.relatedTarget)
                ) {
                  return;
                }
                setShowDelDropdown(false);
                if (
                  delQuery &&
                  delQuery.trim().length >= 2 &&
                  (!delivery.verified ||
                    delQuery.trim() !== delivery.address)
                ) {
                  resolveManualDelivery();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  resolveManualDelivery();
                }
              }}
              placeholder="Type delivery address, landmark, colony, or coordinates..."
              className={`w-full pl-10 pr-24 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-3 transition-all ${
                errors.delivery_location_latitude ||
                errors.delivery_location_longitude
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />

            {/* Quick Locate Button */}
            <button
              type="button"
              onClick={() => resolveManualDelivery()}
              disabled={delSearching || !delQuery.trim()}
              className="absolute inset-y-1.5 right-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              title="Locate manually entered address or coordinates"
            >
              {delSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Locate</span>
                </>
              )}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showDelDropdown &&
            (delSuggestions.length > 0 ||
              (delQuery && delQuery.trim().length >= 2)) && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-40 max-h-64 overflow-y-auto">
                {/* Top option: Use exact typed text */}
                {delQuery && delQuery.trim().length >= 2 && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      resolveManualDelivery(delQuery);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-100 transition-colors flex items-center gap-2.5 group mb-1 cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-700 truncate">
                        Use manual entry: &ldquo;{delQuery}&rdquo;
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Geocode this exact text without picking a suggestion
                      </p>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-700" />
                  </button>
                )}

                {/* Suggestions list */}
                {delSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectDeliverySuggestion(item);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {item.fullAddress}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

          {/* Coordinate Pill & Manual Coordinate Editor */}
          {showDelCoordEdit ? (
            <div className="mt-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-end gap-2.5">
              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={delLatInput}
                  onChange={(e) => setDelLatInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="-90 to 90"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={delLonInput}
                  onChange={(e) => setDelLonInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="-180 to 180"
                />
              </div>
              <div className="flex items-center gap-1.5 pb-0.5">
                <button
                  type="button"
                  onClick={handleApplyDelCoords}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 cursor-pointer transition-all"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setShowDelCoordEdit(false)}
                  className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className="text-gray-500 font-medium truncate max-w-xs"
                title={delivery.address}
              >
                🏠 {delivery.address || "Address will appear after selection"}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-[11px] font-mono text-gray-600">
                  Lat: {Number(delivery.latitude).toFixed(4)}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-[11px] font-mono text-gray-600">
                  Lon: {Number(delivery.longitude).toFixed(4)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDelLatInput(delivery.latitude);
                    setDelLonInput(delivery.longitude);
                    setShowDelCoordEdit(true);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  title="Edit exact coordinates manually"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
