"use client";
import { EventType, Region } from "@/lib/types";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const TYPES: EventType[] = [
  "festival","custom","nature","cultural","religious","sport","market","royal"
];

const REGIONS: Region[] = [
  "London","South East","South West","East of England",
  "East Midlands","West Midlands","Yorkshire",
  "North West","North East","Scotland","Wales","Northern Ireland"
];

interface Props {
  month: number | null;
  region: Region | null;
  type: EventType | null;
  minPop: number;
  onMonth: (m: number | null) => void;
  onRegion: (r: Region | null) => void;
  onType: (t: EventType | null) => void;
  onMinPop: (p: number) => void;
  onReset: () => void;
}

export default function FilterBar({
  month, region, type, minPop,
  onMonth, onRegion, onType, onMinPop, onReset,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Filters</h2>
        <button onClick={onReset} className="text-xs text-slate-400 hover:text-slate-600 underline">
          Reset all
        </button>
      </div>

      {/* Month */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">Month</p>
        <div className="flex flex-wrap gap-1">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => onMonth(month === i + 1 ? null : i + 1)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                month === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">Region</p>
        <div className="flex flex-wrap gap-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => onRegion(region === r ? null : r)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                region === r
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">Type</p>
        <div className="flex flex-wrap gap-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onType(type === t ? null : t)}
              className={`px-2 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                type === t
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Popularity */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">
          Min popularity: {"★".repeat(minPop)}{"☆".repeat(5 - minPop)}
        </p>
        <input
          type="range" min={1} max={5} value={minPop}
          onChange={(e) => onMinPop(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>
    </div>
  );
}
