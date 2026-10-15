import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Scale, 
  Flame, 
  Droplets, 
  Plus, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Award,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { DailyTargets, DayLog, UserProfile, WeightEntry } from '../types/nutrition.ts';
import { calculateNutrientTotals } from '../utils/nutritionCalculations.ts';

interface ProgressChartsViewProps {
  profile: UserProfile;
  targets: DailyTargets;
  dayLogs: Record<string, DayLog>;
  weightHistory: WeightEntry[];
  onAddWeightEntry: (entry: WeightEntry) => void;
  onDeleteWeightEntry: (date: string) => void;
}

export const ProgressChartsView: React.FC<ProgressChartsViewProps> = ({
  profile,
  targets,
  dayLogs,
  weightHistory,
  onAddWeightEntry,
  onDeleteWeightEntry,
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [newWeightDate, setNewWeightDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newWeightNote, setNewWeightNote] = useState<string>('');
  const [isAddingWeight, setIsAddingWeight] = useState<boolean>(false);

  // Sort weight history chronologically
  const sortedWeight = useMemo(() => {
    return [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightHistory]);

  const latestWeight = sortedWeight.length > 0 ? sortedWeight[sortedWeight.length - 1].weightKg : profile.weightKg;
  const initialWeight = sortedWeight.length > 0 ? sortedWeight[0].weightKg : profile.weightKg;
  const totalWeightChange = Math.round((latestWeight - initialWeight) * 10) / 10;
  const toGoal = Math.round((latestWeight - profile.targetWeightKg) * 10) / 10;

  // Build daily timeline for rangeDays
  const timelineData = useMemo(() => {
    const list: {
      date: string;
      label: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      waterMl: number;
      isTargetMet: boolean;
    }[] = [];

    const now = new Date();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = dayLogs[dateStr];
      const totals = log ? calculateNutrientTotals(log.meals) : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      const water = log ? log.waterMl : 0;
      
      const dayName = d.toLocaleDateString('cs-CZ', { weekday: 'short' });
      const dayNum = d.getDate();

      list.push({
        date: dateStr,
        label: `${dayName} ${dayNum}`,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        waterMl: water,
        isTargetMet: Math.abs(totals.calories - targets.calories) <= 250,
      });
    }

    return list;
  }, [rangeDays, dayLogs, targets.calories]);

  // Aggregate stats
  const activeDaysWithMeals = timelineData.filter((d) => d.calories > 0);
  const avgCalories = activeDaysWithMeals.length > 0 
    ? Math.round(activeDaysWithMeals.reduce((acc, d) => acc + d.calories, 0) / activeDaysWithMeals.length)
    : 0;
  const avgProtein = activeDaysWithMeals.length > 0 
    ? Math.round(activeDaysWithMeals.reduce((acc, d) => acc + d.protein, 0) / activeDaysWithMeals.length)
    : 0;

  // Total macro calories across timeline
  const sumProteinKcal = timelineData.reduce((acc, d) => acc + d.protein * 4, 0);
  const sumCarbsKcal = timelineData.reduce((acc, d) => acc + d.carbs * 4, 0);
  const sumFatKcal = timelineData.reduce((acc, d) => acc + d.fat * 9, 0);
  const totalMacroKcal = sumProteinKcal + sumCarbsKcal + sumFatKcal || 1;

  const proteinRatio = Math.round((sumProteinKcal / totalMacroKcal) * 100);
  const carbsRatio = Math.round((sumCarbsKcal / totalMacroKcal) * 100);
  const fatRatio = Math.round((sumFatKcal / totalMacroKcal) * 100);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (isNaN(val) || val <= 30 || val >= 300) return;

    onAddWeightEntry({
      date: newWeightDate,
      weightKg: Math.round(val * 10) / 10,
      note: newWeightNote.trim() || undefined,
    });

    setNewWeightInput('');
    setNewWeightNote('');
    setIsAddingWeight(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
              Dlouhodobá analytika & Výsledky
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-heading">
            Přehledné grafy a sledování pokroku
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Sleduj vývoj své hmotnosti, konzistenci kalorického příjmu a poměr makroživin
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto text-xs font-bold">
          <button
            onClick={() => setRangeDays(7)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              rangeDays === 7 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            7 dní
          </button>
          <button
            onClick={() => setRangeDays(14)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              rangeDays === 14 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            14 dní
          </button>
          <button
            onClick={() => setRangeDays(30)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              rangeDays === 30 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            30 dní
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Weight */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Aktuální váha</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-heading">
            {latestWeight} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="text-xs mt-1 text-slate-400 flex items-center gap-1">
            <span>Cíl: <strong>{profile.targetWeightKg} kg</strong></span>
            <span className={`font-bold ml-auto ${toGoal <= 0 ? 'text-emerald-400' : 'text-indigo-300'}`}>
              {toGoal <= 0 ? 'Cíl splněn!' : `Zbývá ${toGoal} kg`}
            </span>
          </div>
        </div>

        {/* Total Weight Change */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Změna váhy</span>
            {totalWeightChange < 0 ? (
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-heading ${totalWeightChange <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalWeightChange > 0 ? `+${totalWeightChange}` : totalWeightChange} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="text-xs mt-1 text-slate-400">
            Od startovní váhy {initialWeight} kg
          </div>
        </div>

        {/* Average Calories */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Průměrný denní příjem</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-heading">
            {avgCalories} <span className="text-sm font-normal text-slate-400">kcal</span>
          </div>
          <div className="text-xs mt-1 text-slate-400">
            Cílový plán: <strong>{targets.calories} kcal/den</strong>
          </div>
        </div>

        {/* Average Protein */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Průměr bílkovin</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400 font-heading">
            {avgProtein} <span className="text-sm font-normal text-slate-400">g/den</span>
          </div>
          <div className="text-xs mt-1 text-slate-400">
            Doporučené minimum: <strong>{targets.proteinGrams} g</strong>
          </div>
        </div>
      </div>

      {/* Graph 1: Weight Evolution Chart */}
      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              Vývoj tělesné hmotnosti (kg)
            </h3>
            <p className="text-xs text-slate-400">
              Průběh vážení s vyznačenou cílovou hodnotou ({profile.targetWeightKg} kg)
            </p>
          </div>

          <button
            onClick={() => setIsAddingWeight(!isAddingWeight)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Zapsat nové vážení</span>
          </button>
        </div>

        {/* Add weight inline form */}
        {isAddingWeight && (
          <form onSubmit={handleSaveWeight} className="p-4 bg-slate-900 rounded-2xl border border-indigo-500/30 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <label htmlFor="weight-date" className="text-xs text-slate-300">Datum:</label>
              <input
                id="weight-date"
                type="date"
                value={newWeightDate}
                onChange={(e) => setNewWeightDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="weight-val" className="text-xs text-slate-300">Váha (kg):</label>
              <input
                id="weight-val"
                type="number"
                step="0.1"
                placeholder="Např. 81.5"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                className="w-24 bg-slate-800 border border-slate-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg"
                required
                autoFocus
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <input
                type="text"
                placeholder="Poznámka (např. po tréninku, ráno nalačno...)"
                value={newWeightNote}
                onChange={(e) => setNewWeightNote(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400"
              >
                Uložit
              </button>
              <button
                type="button"
                onClick={() => setIsAddingWeight(false)}
                className="px-3 py-1.5 text-slate-400 text-xs hover:text-white"
              >
                Zrušit
              </button>
            </div>
          </form>
        )}

        {/* Visual SVG Weight Chart */}
        {sortedWeight.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Zatím žádné záznamy o váze. Klikni na „Zapsat nové vážení“.
          </div>
        ) : (
          <div className="w-full pt-4 overflow-x-auto">
            <div className="min-w-[500px] h-60 relative flex flex-col justify-end">
              {/* Target Line */}
              <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-emerald-500/40 pointer-events-none z-10 flex items-center justify-end pr-2">
                <span className="text-[10px] text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Cíl: {profile.targetWeightKg} kg
                </span>
              </div>

              {/* Render dynamic SVG Line & Points */}
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${Math.max(sortedWeight.length * 90, 450)} 200`}>
                {(() => {
                  const svgWidth = Math.max(sortedWeight.length * 90, 450);
                  const weights = sortedWeight.map((w) => w.weightKg);
                  const minWeight = Math.min(...weights, profile.targetWeightKg) - 2;
                  const maxWeight = Math.max(...weights, profile.targetWeightKg) + 2;
                  const weightRange = maxWeight - minWeight || 1;

                  const points = sortedWeight.map((w, index) => {
                    const x = (index / Math.max(sortedWeight.length - 1, 1)) * (svgWidth - 60) + 30;
                    const y = 170 - ((w.weightKg - minWeight) / weightRange) * 130;
                    return { x, y, weight: w.weightKg, date: w.date, note: w.note };
                  });

                  const pathData = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                  return (
                    <>
                      {/* Gradient background under line */}
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <path
                        d={`${pathData} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`}
                        fill="url(#weightGrad)"
                      />

                      {/* Main trendline */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Points and labels */}
                      {points.map((p, idx) => (
                        <g key={idx} className="group cursor-pointer">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            className="fill-indigo-400 stroke-slate-900 stroke-2 group-hover:r-7 transition-all"
                          />
                          <text
                            x={p.x}
                            y={p.y - 10}
                            textAnchor="middle"
                            className="fill-white text-[11px] font-bold"
                          >
                            {p.weight} kg
                          </text>
                          <text
                            x={p.x}
                            y={195}
                            textAnchor="middle"
                            className="fill-slate-400 text-[10px]"
                          >
                            {new Date(p.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* Recent Weight Records List */}
        <div className="pt-2">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
            Poslední zapsaná vážení
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {sortedWeight.slice(-6).reverse().map((entry) => (
              <div 
                key={entry.date} 
                className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white text-sm">{entry.weightKg} kg</span>
                  <span className="text-slate-400 ml-2">
                    {new Date(entry.date).toLocaleDateString('cs-CZ')}
                  </span>
                  {entry.note && (
                    <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{entry.note}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteWeightEntry(entry.date)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                  title="Smazat záznam"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graph 2: Calorie Intake History vs Target */}
      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-400" />
              Historie denního příjmu kalorií
            </h3>
            <p className="text-xs text-slate-400">
              Denní příjem v porovnání s cílem {targets.calories} kcal
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> V cílovém rozmezí
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-emerald-400" /> Cíl ({targets.calories} kcal)
            </span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="w-full pt-4 overflow-x-auto">
          <div className="min-w-[480px] h-56 relative flex items-end justify-between gap-2 pb-6 border-b border-slate-800">
            {/* Target Line */}
            <div 
              className="absolute inset-x-0 border-b border-dashed border-emerald-400/50 pointer-events-none z-10"
              style={{ bottom: `${Math.min(90, (targets.calories / 3200) * 100)}%` }}
            >
              <span className="absolute right-0 -top-4 text-[10px] text-emerald-400 bg-slate-900 px-1 rounded">
                Cíl {targets.calories} kcal
              </span>
            </div>

            {timelineData.map((d) => {
              const heightPercent = Math.min(100, Math.round((d.calories / 3200) * 100));
              const isOver = d.calories > targets.calories + 250;
              const isUnder = d.calories > 0 && d.calories < targets.calories - 450;

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-slate-900 border border-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none z-20 whitespace-nowrap">
                    {d.calories} kcal (B: {d.protein}g)
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                      d.calories === 0
                        ? 'bg-slate-800/40 h-2'
                        : isOver
                        ? 'bg-rose-500/80 group-hover:bg-rose-400'
                        : isUnder
                        ? 'bg-sky-500/80 group-hover:bg-sky-400'
                        : 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:brightness-110'
                    }`}
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                  />

                  {/* Day label */}
                  <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Graph 3 & 4: Macro distribution and Water tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Macro Distribution */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Poměr energie z makroživin za {rangeDays} dní
          </h3>
          <p className="text-xs text-slate-400">
            Doporučený standard: Bílkoviny 25–35 %, Sacharidy 40–50 %, Tuky 25–30 %
          </p>

          <div className="h-5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${proteinRatio}%` }} className="bg-sky-500 h-full transition-all" title={`Bílkoviny: ${proteinRatio}%`} />
            <div style={{ width: `${carbsRatio}%` }} className="bg-amber-500 h-full transition-all" title={`Sacharidy: ${carbsRatio}%`} />
            <div style={{ width: `${fatRatio}%` }} className="bg-rose-500 h-full transition-all" title={`Tuky: ${fatRatio}%`} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded-xl">
              <span className="block text-sky-400 font-bold">{proteinRatio} %</span>
              <span className="text-[10px] text-slate-400">Bílkoviny</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl">
              <span className="block text-amber-400 font-bold">{carbsRatio} %</span>
              <span className="text-[10px] text-slate-400">Sacharidy</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl">
              <span className="block text-rose-400 font-bold">{fatRatio} %</span>
              <span className="text-[10px] text-slate-400">Tuky</span>
            </div>
          </div>
        </div>

        {/* Water Adherence */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Pitný režim v průběhu týdne
          </h3>
          <p className="text-xs text-slate-400">
            Denní cíl hydratace: {targets.waterMl} ml
          </p>

          <div className="space-y-1.5 pt-1">
            {timelineData.slice(-5).map((d) => {
              const waterPct = Math.min(100, Math.round((d.waterMl / targets.waterMl) * 100));
              return (
                <div key={d.date} className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-slate-400 truncate">{d.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full" 
                      style={{ width: `${waterPct}%` }} 
                    />
                  </div>
                  <span className="w-16 text-right font-semibold text-slate-200">
                    {d.waterMl} ml
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
