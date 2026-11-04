import React from "react";
import { Utensils, Sparkles, RotateCcw } from "lucide-react";
import { DEMO_PRESETS } from "../utils/presets";


export default function Navbar({
  backendOnline,
  onSelectPreset,
  onReset,
  loading,
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E23744] to-[#ff5865] flex items-center justify-center text-white shadow-md shadow-red-500/20 ring-4 ring-red-50">
            <Utensils className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 font-sans">
               Quick<span className="text-[#E23744]">Bite</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#E23744] border border-red-100">
                AI ETA
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">
              Machine Learning Food Delivery Time Engine
            </p>
          </div>
        </div>

        {/* Right Actions & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              backendOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
            title={
              backendOnline
                ? "FastAPI ML Backend Connected"
                : "Checking backend connection..."
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="hidden md:inline">
              {backendOnline ? "FastAPI Online" : "Connecting..."}
            </span>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E23744]" />
              <span className="hidden sm:inline">Demo</span> Presets
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
              <p className="text-[11px] font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Select Test Scenario
              </p>
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPreset(p)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-xs text-gray-800 hover:text-[#E23744] transition-colors flex items-center justify-between group/item"
                >
                  <span className="font-medium truncate">{p.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 group-hover/item:bg-red-100 text-gray-600 group-hover/item:text-[#E23744]">
                    {p.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            title="Reset form to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
