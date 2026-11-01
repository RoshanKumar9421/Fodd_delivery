import React from "react";
import { Utensils, ShieldCheck } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {

  return (
    <footer className="mt-16 bg-white border-t border-gray-100 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E23744] text-white flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Foodie<span className="text-[#E23744]">Predict</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Next-generation Machine Learning food delivery ETA intelligence
              platform. Combines trained Scikit-learn regressors with real road
              geometries and live atmospheric telemetry.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600 border border-gray-200">
                RandomForest Regressor
              </span>
              <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600 border border-gray-200">
                23 Features
              </span>
              <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600 border border-gray-200">
                OSRM Routing Engine
              </span>
            </div>
          </div>

          {/* Model Features */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Model Inputs
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>• Rider Age & Rating Metrics</li>
              <li>• Vehicle Class & Mechanical State</li>
              <li>• Road Traffic Density & Weather</li>
              <li>• Restaurant & Customer Geocoding</li>
              <li>• Kitchen Prep & Pickup Delay</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Built With
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                React 19 & Tailwind CSS
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                FastAPI & Uvicorn
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Leaflet & OpenStreetMap
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Scikit-Learn Pipeline
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            © {CURRENT_YEAR} FoodiePredict. Inspired by modern food
            delivery experiences.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              API Compatible
            </span>
            <span className="text-gray-300">•</span>
            <span>Fast, Reliable & Accurate</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
