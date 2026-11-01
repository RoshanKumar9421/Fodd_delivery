import React, { useState } from "react";
import {
  User,
  Star,
  Bike,
  Shield,
  CloudSun,
  TrafficCone,
  Building2,
  Clock,
  UtensilsCrossed,
  Sparkles,
  AlertCircle,
  Loader2,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  WEATHER_OPTIONS,
  TRAFFIC_OPTIONS,
  ORDER_TYPE_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  FESTIVAL_OPTIONS,
  CITY_OPTIONS,
  MULTIPLE_DELIVERY_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
} from "../utils/validation";


export default function DeliveryForm({
  formData,
  onChange,
  onSubmit,
  loading,
  errors = {},
  isFormValid = true,
  onSyncCurrentTime,
}) {
  const [touched, setTouched] = useState({});

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const hasError = (field) => touched[field] && !!errors[field];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ==================================================== */}
      {/* Section 1: Delivery Information */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E23744] flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              1. Delivery Partner Information
            </h2>
            <p className="text-xs text-gray-500">
              Rider age, rating, vehicle assignment, and operational condition
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Delivery Person Age */}
          <div>
            <label
              htmlFor="delivery_person_age"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between"
            >
              <span>Delivery Partner Age</span>
              <span className="text-[11px] font-normal text-gray-400">
                18–65 yrs
              </span>
            </label>
            <div className="relative">
              <input
                id="delivery_person_age"
                type="number"
                name="delivery_person_age"
                min="18"
                max="65"
                step="1"
                value={formData.delivery_person_age}
                onChange={onChange}
                onBlur={() => handleBlur("delivery_person_age")}
                aria-invalid={hasError("delivery_person_age")}
                aria-describedby="age-error"
                className={`w-full px-4 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-3 transition-all ${
                  hasError("delivery_person_age")
                    ? "border-red-400 bg-red-50/20 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#E23744] focus:ring-red-100"
                }`}
                placeholder="25"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-gray-400 font-medium pointer-events-none">
                years
              </span>
            </div>
            {hasError("delivery_person_age") && (
              <p
                id="age-error"
                className="mt-1 text-xs text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.delivery_person_age}
              </p>
            )}
          </div>

          {/* Delivery Person Rating */}
          <div>
            <label
              htmlFor="delivery_person_ratings"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Delivery Partner Rating
              </span>
              <span className="text-[11px] font-normal text-gray-400">
                1.0–5.0
              </span>
            </label>
            <div className="relative">
              <input
                id="delivery_person_ratings"
                type="number"
                name="delivery_person_ratings"
                min="1.0"
                max="5.0"
                step="0.1"
                value={formData.delivery_person_ratings}
                onChange={onChange}
                onBlur={() => handleBlur("delivery_person_ratings")}
                aria-invalid={hasError("delivery_person_ratings")}
                aria-describedby="rating-error"
                className={`w-full px-4 py-3 rounded-2xl bg-gray-50/70 border text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-3 transition-all ${
                  hasError("delivery_person_ratings")
                    ? "border-red-400 bg-red-50/20 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#E23744] focus:ring-red-100"
                }`}
                placeholder="4.7"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-amber-500 font-semibold pointer-events-none">
                ★ / 5.0
              </span>
            </div>
            {hasError("delivery_person_ratings") && (
              <p
                id="rating-error"
                className="mt-1 text-xs text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.delivery_person_ratings}
              </p>
            )}
          </div>

          {/* Vehicle Type */}
          <div>
            <label
              htmlFor="type_of_vehicle"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
            >
              <Bike className="w-3.5 h-3.5 text-[#E23744]" />
              Vehicle Type
            </label>
            <div className="relative">
              <select
                id="type_of_vehicle"
                name="type_of_vehicle"
                value={formData.type_of_vehicle}
                onChange={onChange}
                onBlur={() => handleBlur("type_of_vehicle")}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-3 focus:ring-red-100 appearance-none pr-10 transition-all cursor-pointer"
              >
                {VEHICLE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Vehicle Condition */}
          <div>
            <label
              htmlFor="vehicle_condition"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Vehicle Condition (0–3)
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                {formData.vehicle_condition === "3" ||
                formData.vehicle_condition === 3
                  ? "3 (Excellent)"
                  : formData.vehicle_condition === "2" ||
                    formData.vehicle_condition === 2
                  ? "2 (Good)"
                  : formData.vehicle_condition === "1" ||
                    formData.vehicle_condition === 1
                  ? "1 (Fair)"
                  : "0 (Poor)"}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((val) => {
                const isSelected = Number(formData.vehicle_condition) === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      onChange({
                        target: { name: "vehicle_condition", value: val },
                      })
                    }
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-[#E23744] text-white border-[#E23744] shadow-xs scale-102"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Level {val}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* Section 2: Delivery & Environmental Conditions */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E23744] flex items-center justify-center font-bold">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              2. Delivery Conditions & Environment
            </h2>
            <p className="text-xs text-gray-500">
              Weather, traffic congestion, multiple deliveries, and city tier
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Weather */}
          <div>
            <label
              htmlFor="weather_conditions"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Weather Conditions
            </label>
            <div className="relative">
              <select
                id="weather_conditions"
                name="weather_conditions"
                value={formData.weather_conditions}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-3 focus:ring-red-100 appearance-none pr-10 transition-all cursor-pointer"
              >
                {WEATHER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Traffic Density */}
          <div>
            <label
              htmlFor="road_traffic_density"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
            >
              <TrafficCone className="w-3.5 h-3.5 text-amber-500" />
              Traffic Density
            </label>
            <div className="relative">
              <select
                id="road_traffic_density"
                name="road_traffic_density"
                value={formData.road_traffic_density}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-3 focus:ring-red-100 appearance-none pr-10 transition-all cursor-pointer"
              >
                {TRAFFIC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Multiple Deliveries */}
          <div>
            <label
              htmlFor="multiple_deliveries"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Multiple Deliveries
            </label>
            <div className="relative">
              <select
                id="multiple_deliveries"
                name="multiple_deliveries"
                value={formData.multiple_deliveries}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-3 focus:ring-red-100 appearance-none pr-10 transition-all cursor-pointer"
              >
                {MULTIPLE_DELIVERY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              City Type
            </label>
            <div className="relative">
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-3 focus:ring-red-100 appearance-none pr-10 transition-all cursor-pointer"
              >
                {CITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label
              htmlFor="type_of_order"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#E23744]" />
              Order Type
            </label>
            <div className="relative">
              <select
                id="type_of_order"
                name="type_of_order"
                value={formData.type_of_order}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-3 focus:ring-red-100 appearance-none pr-10 transition-all cursor-pointer"
              >
                {ORDER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Festival */}
          <div>
            <label
              htmlFor="festival"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Festival / Holiday
            </label>
            <div className="relative">
              <select
                id="festival"
                name="festival"
                value={formData.festival}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-3 focus:ring-red-100 appearance-none pr-10 transition-all cursor-pointer"
              >
                {FESTIVAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* Section 3: Order & Pickup Timing */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E23744] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                3. Order & Pickup Timings
              </h2>
              <p className="text-xs text-gray-500">
                Order placement time, restaurant kitchen prep delay, and day of week
              </p>
            </div>
          </div>

          {/* Auto-Sync with Real Clock */}
          <button
            type="button"
            onClick={onSyncCurrentTime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#E23744] bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
            title="Populate current hour, minute, and today's date"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sync Live Clock</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Order Hour */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Order Hr
            </label>
            <input
              type="number"
              name="order_hour"
              min="0"
              max="23"
              value={formData.order_hour}
              onChange={onChange}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Order Min */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Order Min
            </label>
            <input
              type="number"
              name="order_minute"
              min="0"
              max="59"
              value={formData.order_minute}
              onChange={onChange}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Picked Hour */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Pickup Hr
            </label>
            <input
              type="number"
              name="picked_hour"
              min="0"
              max="23"
              value={formData.picked_hour}
              onChange={onChange}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Picked Min */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Pickup Min
            </label>
            <input
              type="number"
              name="picked_minute"
              min="0"
              max="59"
              value={formData.picked_minute}
              onChange={onChange}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Order Day */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Day (1-31)
            </label>
            <input
              type="number"
              name="order_day"
              min="1"
              max="31"
              value={formData.order_day}
              onChange={onChange}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Order Month */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Month (1-12)
            </label>
            <input
              type="number"
              name="order_month"
              min="1"
              max="12"
              value={formData.order_month}
              onChange={onChange}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Day of Week */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Weekday
            </label>
            <div className="relative">
              <select
                name="order_dayofweek"
                value={formData.order_dayofweek}
                onChange={onChange}
                className="w-full px-2.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#E23744] appearance-none pr-6 cursor-pointer"
              >
                {DAY_OF_WEEK_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label.slice(0, 3)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* Submit Button */}
      {/* ==================================================== */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${
            !isFormValid || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-[#E23744] to-[#ff3b4b] text-white hover:from-[#d32330] hover:to-[#eb3141] hover:shadow-red-500/25 active:scale-[0.99] cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running Machine Learning Prediction...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Predict Delivery Time</span>
            </>
          )}
        </button>

        {!isFormValid && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Please resolve the highlighted validation errors above to enable prediction.
          </p>
        )}
      </div>
    </form>
  );
}
