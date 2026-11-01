import React, { useState, useEffect } from "react";
import {
  Bike,
  Clock,
  Navigation,
  Utensils,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PredictionResult({ prediction, formData, _route }) {

  const [animatedTime, setAnimatedTime] = useState(0);

  const targetTime = prediction?.predicted_delivery_time || 0;

  // Smooth counter animation from 0 to predicted delivery time
  useEffect(() => {
    if (!targetTime) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#E23744", "#ff6b6b", "#ffd166", "#06d6a0"],
      });
    } catch {
      // Ignore if canvas-confetti is not supported in environment
    }

    let start = 0;
    const duration = 1200; // 1.2s
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (targetTime - start) * easedProgress);

      setAnimatedTime(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setAnimatedTime(targetTime);
      }
    }

    requestAnimationFrame(updateCounter);
  }, [targetTime]);

  if (!prediction) return null;

  // Delivery status badge and speed interpretation
  let speedBadge = "⚡ Express Delivery";
  let interpretation = `Your order is expected to arrive in approximately ${Math.round(
    targetTime
  )} minutes.`;

  if (formData.road_traffic_density === "Jam") {
    speedBadge = "🔴 Heavy Traffic Alert";
    interpretation = `Heavy road traffic congestion is expected on this route. Estimated arrival in ~${Math.round(
      targetTime
    )} mins.`;
  } else if (
    formData.weather_conditions === "Stormy" ||
    formData.weather_conditions === "Sandstorms"
  ) {
    speedBadge = "🌧️ Weather Advisory";
    interpretation = `Adverse weather conditions may slow transit speeds. Predicted delivery window: ~${Math.round(
      targetTime
    )} mins.`;
  } else if (targetTime < 25) {
    speedBadge = "🚀 Rapid Delivery";
    interpretation = `Optimal road conditions and nearby restaurant kitchen! Arrival anticipated in ~${Math.round(
      targetTime
    )} mins.`;
  }

  return (
    <div className="bg-gradient-to-br from-white via-white to-red-50/40 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-red-100 transition-all">
      {/* Top Tag & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-red-100 text-[#E23744] flex items-center justify-center">
            <Zap className="w-4 h-4 fill-[#E23744]" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E23744]">
            ML Prediction Result
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-[#E23744] border border-red-200">
          {speedBadge}
        </span>
      </div>

      {/* Main Delivery Time Banner */}
      <div className="my-7 text-center">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">
          Estimated Delivery Time
        </p>

        <div className="flex items-baseline justify-center gap-2">
          <span className="text-6xl sm:text-7xl font-black tracking-tight text-gray-900 font-sans">
            {animatedTime}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#E23744]">
            Minutes
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          {interpretation}
        </p>
      </div>

      {/* 4-Stage Visual Delivery Progress Tracker */}
      <div className="my-8 py-5 px-4 bg-white/80 rounded-2xl border border-gray-100 shadow-2xs">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">
          Order Journey Lifecycle
        </p>
        <div className="grid grid-cols-4 gap-2 relative">
          {/* Connector Line */}
          <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-red-100 -z-0" />

          {/* Step 1: Order Placed */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-800 mt-2">
              Order Placed
            </span>
            <span className="text-[10px] text-gray-400">Confirmed</span>
          </div>

          {/* Step 2: Kitchen Prep */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md animate-pulse">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-gray-800 mt-2">
              Kitchen Prep
            </span>
            <span className="text-[10px] text-[#E23744] font-semibold">
              +{prediction.pickup_delay_min} mins
            </span>
          </div>

          {/* Step 3: Out for Delivery */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Bike className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-gray-800 mt-2">
              Rider Transit
            </span>
            <span className="text-[10px] text-gray-400 capitalize">
              {formData.type_of_vehicle}
            </span>
          </div>

          {/* Step 4: Delivered */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-gray-800 mt-2">
              Doorstep
            </span>
            <span className="text-[10px] text-gray-400">ETA ~{animatedTime}m</span>
          </div>
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        {/* Distance */}
        <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Navigation className="w-3.5 h-3.5 text-[#E23744]" />
            Distance
          </div>
          <p className="text-lg font-bold text-gray-900">
            {prediction.distance_km}{" "}
            <span className="text-xs text-gray-500">km</span>
          </p>
          <p className="text-[10px] text-gray-400">Haversine metric</p>
        </div>

        {/* Kitchen Pickup Delay */}
        <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Kitchen Delay
          </div>
          <p className="text-lg font-bold text-gray-900">
            {prediction.pickup_delay_min}{" "}
            <span className="text-xs text-gray-500">min</span>
          </p>
          <p className="text-[10px] text-gray-400">Food preparation</p>
        </div>

        {/* Traffic Density */}
        <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Bike className="w-3.5 h-3.5 text-blue-500" />
            Traffic Flow
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formData.road_traffic_density}
          </p>
          <p className="text-[10px] text-gray-400">Route congestion</p>
        </div>

        {/* Weather Impact */}
        <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Weather
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formData.weather_conditions}
          </p>
          <p className="text-[10px] text-gray-400">Atmospheric condition</p>
        </div>
      </div>
    </div>
  );
}
