"use client";
import { EventType, Preferences, Region } from "@/lib/types";

const TYPES: EventType[] = [
  "festival","custom","nature","cultural","religious","sport","market","royal"
];
const REGIONS: Region[] = [
  "London","South East","South West","East of England",
  "East Midlands","West Midlands","Yorkshire",
  "North West","North East","Scotland","Wales","Northern Ireland"
];

interface Props {
  prefs: Preferences;
  onChange: (p: Preferences) => void;
  onClose: () => void;
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function PreferencesPanel({ prefs, onChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">My Preferences</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-600 mb-2">Favourite regions</p>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => onChange({ ...prefs, regions: toggle(prefs.regions, r) })}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  prefs.regions.includes(r)
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-600 mb-2">Favourite types</p>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...prefs, types: toggle(prefs.types, t) })}
                className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  prefs.types.includes(t)
                    ? "bg-amber-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-600 mb-1">
            Min popularity: {"★".repeat(prefs.minPopularity)}{"☆".repeat(5 - prefs.minPopularity)}
          </p>
          <input
            type="range" min={1} max={5} value={prefs.minPopularity}
            onChange={(e) => onChange({ ...prefs, minPopularity: Number(e.target.value) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <p className="text-xs text-slate-400">
          Preferences are saved locally and used to highlight matching events.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
