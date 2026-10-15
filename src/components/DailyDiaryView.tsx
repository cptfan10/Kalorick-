import React from 'react';
import { 
  Plus, 
  Trash2, 
  Coffee, 
  Apple, 
  Utensils, 
  Cookie, 
  Moon, 
  Droplets, 
  Sparkles, 
  ChevronRight, 
  Scale, 
  FileText,
  AlertCircle,
  CheckCircle2,
  ScanBarcode,
  Flame,
  Activity
} from 'lucide-react';
import type { 
  DailyTargets, 
  DayLog, 
  ExerciseEntry, 
  MealEntry, 
  MealType, 
  NutrientTotals 
} from '../types/nutrition.ts';
import { analyzeDailyStatus } from '../utils/nutritionCalculations.ts';
import { calculateDailyExerciseTotals, calculateNetCalorieBalance } from '../utils/exerciseCalculations.ts';
import { ExerciseTracker } from './ExerciseTracker.tsx';
import { MEAL_TYPE_LABELS } from './AddMealModal.tsx';

interface DailyDiaryViewProps {
  dayLog: DayLog;
  targets: DailyTargets;
  totals: NutrientTotals;
  userWeightKg: number;
  onOpenAddMealModal: (mealType: MealType) => void;
  onOpenBarcodeScanner: () => void;
  onDeleteMealEntry: (mealId: string) => void;
  onAddExercise: (entry: ExerciseEntry) => void;
  onDeleteExercise: (id: string) => void;
  onUpdateWater: (amountMl: number) => void;
  onUpdateDailyWeight: (weightKg: number | undefined) => void;
  onUpdateDailyNote: (note: string) => void;
  onNavigateToAdvisor: () => void;
}

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  snidane: <Coffee className="w-5 h-5 text-amber-400" />,
  svacina_dopoledne: <Apple className="w-5 h-5 text-emerald-400" />,
  obed: <Utensils className="w-5 h-5 text-sky-400" />,
  svacina_odpoledne: <Cookie className="w-5 h-5 text-orange-400" />,
  vecere: <Utensils className="w-5 h-5 text-indigo-400" />,
  druha_vecere: <Moon className="w-5 h-5 text-purple-400" />,
};

const MEAL_TYPES_ORDER: MealType[] = [
  'snidane',
  'svacina_dopoledne',
  'obed',
  'svacina_odpoledne',
  'vecere',
  'druha_vecere',
];

export const DailyDiaryView: React.FC<DailyDiaryViewProps> = ({
  dayLog,
  targets,
  totals,
  userWeightKg,
  onOpenAddMealModal,
  onOpenBarcodeScanner,
  onDeleteMealEntry,
  onAddExercise,
  onDeleteExercise,
  onUpdateWater,
  onUpdateDailyWeight,
  onUpdateDailyNote,
  onNavigateToAdvisor,
}) => {
  const analysis = analyzeDailyStatus(totals, targets);
  const exerciseTotals = calculateDailyExerciseTotals(dayLog.exercises);
  const netBalance = calculateNetCalorieBalance({
    consumedCalories: totals.calories,
    burnedCalories: exerciseTotals.totalCaloriesBurned,
    targetCalories: targets.calories,
  });

  const caloriePercent = Math.min(100, Math.round((totals.calories / (targets.calories || 2000)) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / (targets.proteinGrams || 140)) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbs / (targets.carbsGrams || 200)) * 100));
  const fatPercent = Math.min(100, Math.round((totals.fat / (targets.fatGrams || 65)) * 100));
  const fiberPercent = Math.min(100, Math.round((totals.fiber / (targets.fiberGrams || 28)) * 100));
  const waterPercent = Math.min(100, Math.round((dayLog.waterMl / (targets.waterMl || 2500)) * 100));

  return (
    <div className="space-y-6">
      {/* Quick Action Bar for Diary */}
      <div className="flex items-center justify-between bg-slate-850 border border-slate-800 rounded-2xl p-3 sm:px-5">
        <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Rychlé akce pro dnešní den:
        </span>
        <button
          onClick={onOpenBarcodeScanner}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <ScanBarcode className="w-4 h-4 stroke-[2.5]" />
          <span>Skenovat čárový kód</span>
        </button>
      </div>

      {/* Top Macro Summary Hero Card with Net Calorie Integration */}
      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Calorie Centerpiece with Net Balance */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Kalorická bilance dne
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-heading">
                {totals.calories}
              </span>
              <span className="text-slate-400 text-sm font-semibold">
                / {targets.calories} kcal
              </span>
            </div>

            {/* Exercise Burn & Net Calories Badge */}
            {exerciseTotals.totalCaloriesBurned > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl text-amber-300 font-semibold">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Spáleno cvičením: -{exerciseTotals.totalCaloriesBurned} kcal</span>
                <span>•</span>
                <span className="text-white">Čistý příjem: {netBalance.netCalories} kcal</span>
              </div>
            )}

            {/* Circular / Progress Indicator */}
            <div className="w-full mt-3">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    netBalance.remainingCaloriesWithExercise < 0 
                      ? 'bg-rose-500' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs mt-2 text-slate-400">
                <span>{caloriePercent} % splněno</span>
                <span className={`font-bold ${netBalance.remainingCaloriesWithExercise < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {netBalance.remainingCaloriesWithExercise >= 0 
                    ? `Zbývá: ${netBalance.remainingCaloriesWithExercise} kcal` 
                    : `Překročeno o ${Math.abs(netBalance.remainingCaloriesWithExercise)} kcal`}
                </span>
              </div>
            </div>
          </div>

          {/* Macronutrient Bars */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Rozpad klíčových makroživin
            </h3>

            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> Bílkoviny
                </span>
                <span className="text-slate-300">
                  <strong>{totals.protein}g</strong> / {targets.proteinGrams}g ({proteinPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full transition-all duration-300" style={{ width: `${proteinPercent}%` }} />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Sacharidy
                </span>
                <span className="text-slate-300">
                  <strong>{totals.carbs}g</strong> / {targets.carbsGrams}g ({carbsPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${carbsPercent}%` }} />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Tuky
                </span>
                <span className="text-slate-300">
                  <strong>{totals.fat}g</strong> / {targets.fatGrams}g ({fatPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full transition-all duration-300" style={{ width: `${fatPercent}%` }} />
              </div>
            </div>

            {/* Fiber */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Vláknina
                </span>
                <span className="text-slate-300">
                  <strong>{totals.fiber}g</strong> / {targets.fiberGrams}g ({fiberPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${fiberPercent}%` }} />
              </div>
            </div>

          </div>
        </div>

        {/* Nutritional Advice Alert Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Výživová analýza pro dnešek
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                {analysis.advice}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToAdvisor}
            className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
          >
            <span>Doporučit ideální jídlo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meals Diary Sections */}
      <div className="space-y-4">
        {MEAL_TYPES_ORDER.map((mealType) => {
          const mealsOfType = dayLog.meals.filter((m) => m.mealType === mealType);
          const subtotalKcal = mealsOfType.reduce((sum, m) => sum + m.calories, 0);
          const subtotalProtein = Math.round(mealsOfType.reduce((sum, m) => sum + m.protein, 0) * 10) / 10;
          const subtotalCarbs = Math.round(mealsOfType.reduce((sum, m) => sum + m.carbs, 0) * 10) / 10;
          const subtotalFat = Math.round(mealsOfType.reduce((sum, m) => sum + m.fat, 0) * 10) / 10;

          return (
            <div 
              key={mealType} 
              className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Meal Header */}
              <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    {MEAL_ICONS[mealType]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {MEAL_TYPE_LABELS[mealType]}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{mealsOfType.length} {mealsOfType.length === 1 ? 'položka' : 'položek'}</span>
                      {mealsOfType.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{subtotalKcal} kcal</span>
                          <span>(B: {subtotalProtein}g | S: {subtotalCarbs}g | T: {subtotalFat}g)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAddMealModal(mealType)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/80 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Přidat</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              {mealsOfType.length === 0 ? (
                <div className="py-6 px-5 text-center text-slate-500 text-xs">
                  Zatím žádné zapsané položky v této části dne.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {mealsOfType.map((meal) => (
                    <div 
                      key={meal.id}
                      className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-slate-100 text-sm truncate">{meal.name}</span>
                          <span className="text-xs text-slate-400 font-medium">
                            {meal.portionGrams} {meal.portionUnit}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="text-emerald-400 font-semibold">{meal.calories} kcal</span>
                          <span>B: {meal.protein}g</span>
                          <span>S: {meal.carbs}g</span>
                          <span>T: {meal.fat}g</span>
                          {meal.fiber > 0 && <span>Vl: {meal.fiber}g</span>}
                          {meal.timeStr && <span className="text-slate-500 hidden sm:inline">({meal.timeStr})</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteMealEntry(meal.id)}
                        aria-label={`Smazat ${meal.name}`}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PHYSICAL ACTIVITY & WORKOUT TRACKER SECTION */}
      <ExerciseTracker
        exercises={dayLog.exercises || []}
        userWeightKg={userWeightKg}
        onAddExercise={onAddExercise}
        onDeleteExercise={onDeleteExercise}
      />

      {/* Water & Daily Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Tracker */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Pitný režim</h3>
                <span className="text-xs text-slate-400">
                  {dayLog.waterMl} / {targets.waterMl} ml ({waterPercent}%)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-xs font-bold ${dayLog.waterMl >= targets.waterMl ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {dayLog.waterMl >= targets.waterMl ? 'Cíl splněn!' : `Zbývá ${Math.max(0, targets.waterMl - dayLog.waterMl)} ml`}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onUpdateWater(250)}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              + 250 ml (Sklenice)
            </button>
            <button
              onClick={() => onUpdateWater(500)}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              + 500 ml (Láhev)
            </button>
            <button
              onClick={() => onUpdateWater(-250)}
              disabled={dayLog.waterMl <= 0}
              className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all disabled:opacity-30"
            >
              - 250 ml
            </button>
          </div>
        </div>

        {/* Daily Weight & Note Card */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Ranní váha a poznámka dne</h3>
                <span className="text-xs text-slate-400">Zaznamenej si dnešní pokrok</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                placeholder="Váha v kg"
                value={dayLog.weightKg ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : undefined;
                  onUpdateDailyWeight(val);
                }}
                className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm text-center font-bold text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400 font-semibold">kg</span>
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              placeholder="Jak ses dnes cítil(a), energie, trénink nebo spánek..."
              value={dayLog.note || ''}
              onChange={(e) => onUpdateDailyNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
