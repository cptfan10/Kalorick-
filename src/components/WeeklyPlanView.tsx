import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Sparkles, 
  ChefHat, 
  ShoppingCart, 
  Clock, 
  Check, 
  Plus, 
  ChevronRight, 
  Filter, 
  Copy, 
  AlertCircle,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import type { 
  Allergen, 
  DayPlan, 
  DietaryPreference, 
  FitnessGoal, 
  MealType, 
  PlannedRecipe, 
  UserProfile, 
  WeeklyPlan, 
  WeeklyPlanPreferences 
} from '../types/nutrition.ts';
import { 
  generateShoppingList, 
  generateWeeklyPlan, 
  ShoppingItem 
} from '../utils/weeklyPlanGenerator.ts';

interface WeeklyPlanViewProps {
  profile: UserProfile;
  dailyTargetCalories: number;
  savedPlan?: WeeklyPlan;
  onSavePlan: (plan: WeeklyPlan) => void;
  onLogRecipeToDiary: (recipe: PlannedRecipe) => void;
  onLogDayToDiary: (day: DayPlan) => void;
}

const ALLERGEN_OPTIONS: { id: Allergen; label: string }[] = [
  { id: 'gluten', label: 'Bez lepku' },
  { id: 'lactose', label: 'Bez laktózy' },
  { id: 'nuts', label: 'Bez ořechů' },
  { id: 'eggs', label: 'Bez vajec' },
  { id: 'soy', label: 'Bez sóji' },
  { id: 'seafood', label: 'Bez ryb a mořských plodů' },
];

const DIETARY_OPTIONS: { id: DietaryPreference; label: string }[] = [
  { id: 'balanced', label: 'Vyvážená strava' },
  { id: 'high_protein', label: 'Vysokoproteinová (fitness)' },
  { id: 'low_carb', label: 'Nízkosacharidová (Low-Carb)' },
  { id: 'mediterranean', label: 'Středomořská' },
  { id: 'vegetarian', label: 'Vegetariánská' },
  { id: 'vegan', label: 'Veganská' },
];

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  profile,
  dailyTargetCalories,
  savedPlan,
  onSavePlan,
  onLogRecipeToDiary,
  onLogDayToDiary,
}) => {
  // Plan preferences
  const [caloriesTarget, setCaloriesTarget] = useState(dailyTargetCalories || 2100);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('balanced');
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active plan & viewing sub-tab
  const [activePlan, setActivePlan] = useState<WeeklyPlan>(() => {
    if (savedPlan) return savedPlan;
    return generateWeeklyPlan({
      dailyCalories: dailyTargetCalories,
      goal: profile.goal,
      dietaryPreference: 'balanced',
      allergens: [],
    });
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeViewMode, setActiveViewMode] = useState<'days' | 'shopping'>('days');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [daySuccessMessage, setDaySuccessMessage] = useState<string | null>(null);

  const toggleAllergen = (allergen: Allergen) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const newPlan = generateWeeklyPlan({
        dailyCalories: caloriesTarget,
        goal: profile.goal,
        dietaryPreference,
        allergens: selectedAllergens,
      });
      setActivePlan(newPlan);
      onSavePlan(newPlan);
      setIsGenerating(false);
      setSelectedDayIndex(0);
    }, 400);
  };

  const currentDay = activePlan.days[selectedDayIndex] || activePlan.days[0];
  const shoppingList = useMemo(() => generateShoppingList(activePlan), [activePlan]);

  const toggleShoppingCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogDay = () => {
    onLogDayToDiary(currentDay);
    setDaySuccessMessage(`Všechna jídla pro ${currentDay.dayName} byla zapsána do dnešního deníku!`);
    setTimeout(() => setDaySuccessMessage(null), 3500);
  };

  const handleCopyShoppingList = () => {
    let text = `🛒 NÁKUPNÍ SEZNAM NUTRIPLAN NA TÝDEN:\n\n`;
    const catLabels: Record<string, string> = {
      produce: '🍏 Ovoce a zelenina',
      meat: '🥩 Maso, ryby a tofu',
      dairy: '🥛 Mléčné výrobky a vejce',
      grains: '🌾 Pečivo, rýže a obiloviny',
      pantry: '🧂 Spíž a dochucovadla',
    };

    Object.entries(shoppingList).forEach(([cat, items]) => {
      if (items.length > 0) {
        text += `${catLabels[cat] || cat}:\n`;
        items.forEach((item) => {
          text += `• ${item.name}: ${item.totalAmount} ${item.unit}\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    alert('Nákupní seznam byl zkopírován do schránky!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <ChefHat className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
              Týdenní stravovací plánování
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-heading">
            Personalizovaný jídelníček na celý týden
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Kompletní recepty s přesnými ingrediencemi, postupy vaření a automatickým nákupním seznamem
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveViewMode('days')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeViewMode === 'days'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jídelní plán (7 dní)</span>
          </button>
          <button
            onClick={() => setActiveViewMode('shopping')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeViewMode === 'shopping'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Nákupní seznam</span>
          </button>
        </div>
      </div>

      {/* Preferences & Generation Form */}
      <form onSubmit={handleGenerate} className="bg-slate-850 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-400" />
            Nastavení parametrů jídelníčku
          </h3>
          <span className="text-xs text-slate-400">
            Cílový denní příjem: <strong className="text-teal-300">{caloriesTarget} kcal</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dietary Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Stravovací styl a preference
            </label>
            <select
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            >
              {DIETARY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Calories Target */}
          <div className="space-y-1.5">
            <label htmlFor="plan-calories" className="text-xs font-semibold text-slate-300 block">
              Cílový kalorický příjem (kcal/den)
            </label>
            <div className="relative">
              <input
                id="plan-calories"
                type="number"
                min="1200"
                max="5000"
                value={caloriesTarget}
                onChange={(e) => setCaloriesTarget(parseInt(e.target.value) || 2000)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-teal-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kcal</span>
            </div>
          </div>
        </div>

        {/* Allergens & Intolerances */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-300 block">
            Alergie a potravinové intolerance (vyloučit z plánu):
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {ALLERGEN_OPTIONS.map((a) => {
              const isSelected = selectedAllergens.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAllergen(a.id)}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {isSelected ? `✕ ${a.label}` : a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Generuji týdenní recepty...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Přegenerovat týdenní plán na míru</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* VIEW MODE 1: 7-DAY MEAL PLAN */}
      {activeViewMode === 'days' && (
        <div className="space-y-5">
          {/* Day selection tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {activePlan.days.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={day.dayName}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex-1 min-w-[100px] p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-teal-500/20 to-slate-850 border-teal-500 text-white shadow-lg'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`block font-bold text-sm ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                    {day.dayName}
                  </span>
                  <span className="text-[11px] block mt-0.5 text-slate-400">
                    {day.totalCalories} kcal
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Day Header Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white font-heading">
                  Jídelníček na {currentDay.dayName}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                  {currentDay.totalCalories} kcal
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Bílkoviny: <strong className="text-sky-400">{currentDay.totalProtein}g</strong></span>
                <span>•</span>
                <span>Sacharidy: <strong className="text-amber-400">{currentDay.totalCarbs}g</strong></span>
                <span>•</span>
                <span>Tuky: <strong className="text-rose-400">{currentDay.totalFat}g</strong></span>
                <span>•</span>
                <span>Vláknina: <strong className="text-emerald-300">{currentDay.totalFiber}g</strong></span>
              </div>
            </div>

            <button
              onClick={handleLogDay}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 font-bold text-xs rounded-xl shadow transition-all active:scale-95 shrink-0"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Zapsat celý tento den do deníku</span>
            </button>
          </div>

          {daySuccessMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{daySuccessMessage}</span>
            </div>
          )}

          {/* Meals list for selected day */}
          <div className="space-y-4">
            {currentDay.meals.map((recipe, idx) => {
              const isExpanded = expandedRecipeId === recipe.id;
              const mealTypeTitles: Record<string, string> = {
                snidane: 'Snídaně',
                svacina_dopoledne: 'Dopolední svačina',
                obed: 'Oběd',
                svacina_odpoledne: 'Odpolední svačina',
                vecere: 'Večeře',
              };

              return (
                <div
                  key={recipe.id}
                  className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700/80 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {mealTypeTitles[recipe.mealType] || 'Jídlo dne'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {recipe.preparationTimeMin} min
                        </span>
                        <span className="text-xs text-slate-500">• {recipe.difficulty}</span>
                      </div>
                      <h4 className="text-base font-bold text-white">{recipe.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{recipe.description}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-extrabold text-emerald-400">{recipe.calories} kcal</span>
                        <div className="text-[11px] text-slate-400">
                          B: {recipe.protein}g • S: {recipe.carbs}g • T: {recipe.fat}g
                        </div>
                      </div>

                      <button
                        onClick={() => onLogRecipeToDiary(recipe)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Zapsat recept</span>
                      </button>
                    </div>
                  </div>

                  {/* Toggle recipe details */}
                  <div className="border-t border-slate-800/80 pt-3">
                    <button
                      type="button"
                      onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Skrýt suroviny a postup' : 'Zobrazit suroviny a postup přípravy'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs animate-in fade-in duration-150">
                        {/* Ingredients */}
                        <div>
                          <h5 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 mb-2">
                            Ingredience pro 1 porci:
                          </h5>
                          <ul className="space-y-1 list-disc list-inside text-slate-200">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i}>
                                <strong>{ing.name}</strong>: {ing.amount} {ing.unit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                          <h5 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 mb-2">
                            Postup přípravy:
                          </h5>
                          <ol className="space-y-1.5 list-decimal list-inside text-slate-200">
                            {recipe.instructions.map((step, i) => (
                              <li key={i} className="leading-relaxed">{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SHOPPING LIST */}
      {activeViewMode === 'shopping' && (
        <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                Nákupní seznam na 7 dní
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automaticky sečtené suroviny ze všech receptů v týdnu pro snadný nákup v obchodě
              </p>
            </div>

            <button
              onClick={handleCopyShoppingList}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors self-start sm:self-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopírovat seznam do schránky</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(shoppingList).map(([catKey, items]) => {
              if (items.length === 0) return null;
              const catNames: Record<string, string> = {
                produce: '🍏 Ovoce a zelenina',
                meat: '🥩 Maso, ryby a tofu',
                dairy: '🥛 Mléčné výrobky a vejce',
                grains: '🌾 Pečivo, rýže a obiloviny',
                pantry: '🧂 Spíž a dochucovadla',
              };

              return (
                <div key={catKey} className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-teal-400 border-b border-slate-800 pb-2">
                    {catNames[catKey] || catKey} ({items.length})
                  </h4>

                  <ul className="space-y-1.5 text-xs">
                    {items.map((item) => {
                      const itemKey = `${catKey}_${item.name}`;
                      const isChecked = !!checkedItems[itemKey];

                      return (
                        <li 
                          key={itemKey}
                          onClick={() => toggleShoppingCheck(itemKey)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? 'bg-slate-800/30 text-slate-500 line-through' : 'hover:bg-slate-800/60 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent onClick
                              className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                            />
                            <span>{item.name}</span>
                          </div>
                          <span className={`font-mono text-[11px] font-bold ${isChecked ? 'text-slate-600' : 'text-teal-300'}`}>
                            {item.totalAmount} {item.unit}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
