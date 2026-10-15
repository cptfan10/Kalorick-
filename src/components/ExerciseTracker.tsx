import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Flame, 
  Clock, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Dumbbell, 
  HeartPulse, 
  Sparkles, 
  X,
  Gauge
} from 'lucide-react';
import type { ExerciseActivityType, ExerciseEntry, ExerciseIntensity } from '../types/nutrition.ts';
import { 
  ACTIVITIES_DATABASE, 
  calculateExerciseCalories 
} from '../utils/exerciseCalculations.ts';

interface ExerciseTrackerProps {
  exercises: ExerciseEntry[];
  userWeightKg: number;
  onAddExercise: (entry: ExerciseEntry) => void;
  onDeleteExercise: (id: string) => void;
}

export const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({
  exercises,
  userWeightKg,
  onAddExercise,
  onDeleteExercise,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityType, setActivityType] = useState<ExerciseActivityType>('running');
  const [customName, setCustomName] = useState('');
  const [durationInput, setDurationInput] = useState('45');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');
  const [note, setNote] = useState('');

  const durationMinutes = Math.max(1, parseInt(durationInput) || 30);
  const currentActivityMeta = ACTIVITIES_DATABASE[activityType] || ACTIVITIES_DATABASE.custom;

  // Live estimated calories
  const estimatedCalories = useMemo(() => {
    return calculateExerciseCalories({
      activityType,
      durationMinutes,
      intensity,
      weightKg: userWeightKg,
    });
  }, [activityType, durationMinutes, intensity, userWeightKg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: ExerciseEntry = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      activityType,
      customName: activityType === 'custom' ? customName.trim() || 'Vlastní aktivita' : undefined,
      durationMinutes,
      intensity,
      caloriesBurned: estimatedCalories,
      timeStr: new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
      note: note.trim() || undefined,
    };

    onAddExercise(newEntry);
    setIsModalOpen(false);
    setNote('');
  };

  const totalMinutes = exercises.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

  return (
    <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Fyzická aktivita a trénink
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                MET výpočet
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Spálené kalorie se automaticky započítávají do čisté denní kalorické bilance
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Zaznamenat cvičení</span>
        </button>
      </div>

      {/* Summary stats bar if exercises exist */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center text-xs">
          <div className="p-1">
            <span className="text-slate-400 block text-[10px]">Dnešní cvičení</span>
            <span className="font-bold text-white text-sm">{exercises.length} {exercises.length === 1 ? 'trénink' : 'tréninky'}</span>
          </div>
          <div className="p-1">
            <span className="text-slate-400 block text-[10px]">Celkový čas aktivity</span>
            <span className="font-bold text-amber-300 text-sm">{totalMinutes} min</span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-1">
            <span className="text-slate-400 block text-[10px]">Celkem spáleno</span>
            <span className="font-black text-orange-400 text-sm">-{totalBurned} kcal</span>
          </div>
        </div>
      )}

      {/* List of exercises */}
      {exercises.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs">
          Dnes zatím žádné zaznamenané cvičení. Klikněte na „Zaznamenat cvičení“.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {exercises.map((item) => {
            const meta = ACTIVITIES_DATABASE[item.activityType] || ACTIVITIES_DATABASE.custom;
            const displayName = item.customName || meta.label;

            return (
              <div 
                key={item.id} 
                className="py-3 flex items-center justify-between hover:bg-slate-800/20 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="p-2 bg-slate-800 rounded-xl text-amber-400 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm truncate">{displayName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        item.intensity === 'high' 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : item.intensity === 'moderate'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {item.intensity === 'high' ? 'Vysoká intenzita' : item.intensity === 'moderate' ? 'Střední intenzita' : 'Lehká intenzita'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{item.durationMinutes} minut</span>
                      <span>•</span>
                      <span className="text-orange-400 font-extrabold">-{item.caloriesBurned} kcal</span>
                      {item.note && <span className="truncate text-slate-500">({item.note})</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteExercise(item.id)}
                  aria-label={`Smazat ${displayName}`}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Exercise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-modal-title"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div>
                <h2 id="exercise-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Zaznamenat fyzickou aktivitu
                </h2>
                <p className="text-xs text-slate-400">Výpočet vychází z tvé váhy ({userWeightKg} kg) a tabulek MET</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Zavřít okno"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Activity Type Picker */}
              <div className="space-y-1">
                <label htmlFor="activity-type" className="text-xs font-semibold text-slate-300">
                  Druh cvičení / sport
                </label>
                <select
                  id="activity-type"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as ExerciseActivityType)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(ACTIVITIES_DATABASE).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              {activityType === 'custom' && (
                <div className="space-y-1">
                  <label htmlFor="custom-activity-name" className="text-xs font-semibold text-slate-300">
                    Název vlastní aktivity
                  </label>
                  <input
                    id="custom-activity-name"
                    type="text"
                    placeholder="Např. Badminton, Tanec, Sekání dřeva..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              )}

              {/* Duration in Minutes with Quick Buttons */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="exercise-duration" className="text-xs font-semibold text-slate-300">
                    Délka trvání (minuty)
                  </label>
                  <span className="text-xs text-amber-400 font-bold">{durationMinutes} min</span>
                </div>
                <input
                  id="exercise-duration"
                  type="number"
                  min="1"
                  max="600"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                  required
                />
                <div className="flex gap-1.5 pt-1 text-xs">
                  {[15, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationInput(String(mins))}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                        durationMinutes === mins
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Intenzita cvičení
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['low', 'moderate', 'high'] as ExerciseIntensity[]).map((level) => {
                    const isSelected = intensity === level;
                    const labels = {
                      low: 'Lehká / Nízká',
                      moderate: 'Střední',
                      high: 'Vysoká / Náročná',
                    };

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setIntensity(level)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <div className="font-semibold">{labels[level]}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  {currentActivityMeta.intensityLabels[intensity]}
                </p>
              </div>

              {/* Estimated Calories Burned Preview Card */}
              <div className="p-4 bg-gradient-to-r from-amber-950/40 via-orange-950/40 to-slate-900 rounded-2xl border border-amber-500/40 text-center space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                  Odhadovaný energetický výdej
                </span>
                <div className="text-3xl font-black text-white font-heading">
                  ~ {estimatedCalories} <span className="text-lg font-normal text-amber-300">kcal</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  MET: {currentActivityMeta.met[intensity]} • Váha: {userWeightKg} kg
                </span>
              </div>

              {/* Optional Note */}
              <div className="space-y-1">
                <label htmlFor="exercise-note" className="text-xs font-semibold text-slate-300">
                  Poznámka k tréninku (volitelné)
                </label>
                <input
                  id="exercise-note"
                  type="text"
                  placeholder="Např. 5 km tempo 5:20 min/km, nohy a břicho..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Uložit aktivitu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
