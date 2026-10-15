import React, { useState } from 'react';
import { 
  Sparkles, 
  ChefHat, 
  Clock, 
  Flame, 
  Check, 
  Plus, 
  Lightbulb, 
  ArrowRight, 
  AlertCircle,
  Wand2,
  Utensils
} from 'lucide-react';
import { DailyTargets, FoodItem, MealRecommendation, MealType, NutrientTotals } from '../types/nutrition.ts';
import { recommendMealsForRemainingMacros } from '../utils/mealAdvisor.ts';
import { analyzeDailyStatus } from '../utils/nutritionCalculations.ts';

interface MealAdvisorViewProps {
  targets: DailyTargets;
  totals: NutrientTotals;
  userGoal: string;
  foodDatabase: FoodItem[];
  onAddRecommendationToDiary: (rec: MealRecommendation, mealType: MealType) => void;
}

export const MealAdvisorView: React.FC<MealAdvisorViewProps> = ({
  targets,
  totals,
  userGoal,
  foodDatabase,
  onAddRecommendationToDiary,
}) => {
  const analysis = analyzeDailyStatus(totals, targets);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('obed');
  const [activeSubTab, setActiveSubTab] = useState<'smart_matches' | 'ai_chef'>('smart_matches');

  // AI Chef State
  const [fridgeIngredients, setFridgeIngredients] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<MealRecommendation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Algorithmic Smart Matches based on current remaining macros
  const smartMatches = recommendMealsForRemainingMacros(analysis, userGoal);

  const handleGenerateAiRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAi(true);
    setAiError(null);
    setAiRecipe(null);

    try {
      const response = await fetch('/api/recommend-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caloriesRemaining: analysis.caloriesRemaining,
          proteinRemaining: analysis.proteinRemaining,
          carbsRemaining: analysis.carbsRemaining,
          fatRemaining: analysis.fatRemaining,
          userGoal,
          mealType: selectedMealType,
          ingredientsAvailable: fridgeIngredients,
          dietaryNotes,
        }),
      });

      const data = await response.json();

      if (data.recommendation) {
        setAiRecipe({
          id: `ai_${Date.now()}`,
          ...data.recommendation,
        });
      } else {
        // Fallback to top smart match if API returned fallback message or no key
        const bestFallback = smartMatches[0];
        setAiRecipe({
          ...bestFallback,
          id: `fallback_${Date.now()}`,
          whyRecommended: `${bestFallback.whyRecommended} (Přizpůsobeno podle tvých ${analysis.caloriesRemaining} zbývajících kcal)`,
        });
      }
    } catch (err: any) {
      console.warn('API fetch error, using local smart recommendation engine:', err);
      // Seamless offline fallback
      const bestFallback = smartMatches[0];
      setAiRecipe({
        ...bestFallback,
        id: `fallback_${Date.now()}`,
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAddMeal = (rec: MealRecommendation) => {
    onAddRecommendationToDiary(rec, selectedMealType);
    setAddedSuccessId(rec.id);
    setTimeout(() => setAddedSuccessId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                <ChefHat className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                Osobní výživový rádce & AI Šéfkuchař
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-heading">
              Doporučení jídel na míru tvým makrům
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Analyzujeme tvůj dosavadní dnešní jídelníček a navrhujeme jídla, která přesně doplní chybějící bílkoviny, energii i mikroživiny.
            </p>
          </div>

          {/* Quick Target Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 shrink-0 text-center">
            <div className="p-1.5">
              <span className="block text-[10px] text-slate-400">Zbývá kcal</span>
              <span className={`text-sm font-black ${analysis.caloriesRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {analysis.caloriesRemaining}
              </span>
            </div>
            <div className="p-1.5">
              <span className="block text-[10px] text-slate-400">Chybí bílkovin</span>
              <span className="text-sm font-bold text-sky-400">
                {Math.max(0, analysis.proteinRemaining)}g
              </span>
            </div>
            <div className="p-1.5">
              <span className="block text-[10px] text-slate-400">Chybí sacharidů</span>
              <span className="text-sm font-bold text-amber-400">
                {Math.max(0, analysis.carbsRemaining)}g
              </span>
            </div>
            <div className="p-1.5">
              <span className="block text-[10px] text-slate-400">Chybí tuků</span>
              <span className="text-sm font-bold text-rose-400">
                {Math.max(0, analysis.fatRemaining)}g
              </span>
            </div>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('smart_matches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'smart_matches'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Okamžitá doporučení ({smartMatches.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai_chef')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'ai_chef'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Šéfkuchař podle surovin doma</span>
          </button>
        </div>
      </div>

      {/* Target Meal Type Selector for Quick Add */}
      <div className="flex items-center justify-between bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-xs">
        <span className="font-semibold text-slate-300">
          Kam chceš doporučené jídlo zapsat:
        </span>
        <select
          value={selectedMealType}
          onChange={(e) => setSelectedMealType(e.target.value as MealType)}
          className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
        >
          <option value="snidane">Snídaně</option>
          <option value="svacina_dopoledne">Dopolední svačina</option>
          <option value="obed">Oběd</option>
          <option value="svacina_odpoledne">Odpolední svačina</option>
          <option value="vecere">Večeře</option>
          <option value="druha_vecere">Druhá večeře</option>
        </select>
      </div>

      {/* Subtab 1: Smart Matches Cards */}
      {activeSubTab === 'smart_matches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {smartMatches.map((meal) => {
            const isJustAdded = addedSuccessId === meal.id;
            return (
              <div
                key={meal.id}
                className="bg-slate-850 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {meal.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> {meal.preparationTimeMin} min
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                    {meal.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                    {meal.description}
                  </p>

                  {/* Why recommended highlight */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Proč právě toto:</strong> {meal.whyRecommended}</span>
                  </div>

                  {/* Ingredients preview */}
                  <div className="mt-3">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                      Suroviny:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                      {meal.ingredients.map((ing, idx) => (
                        <li key={idx} className="truncate">{ing}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  {/* Macros badges */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <span className="block text-[10px] text-slate-400">Kcal</span>
                      <span className="font-extrabold text-emerald-400">{meal.calories}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <span className="block text-[10px] text-slate-400">Bílkoviny</span>
                      <span className="font-bold text-sky-400">{meal.protein}g</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <span className="block text-[10px] text-slate-400">Sacharidy</span>
                      <span className="font-bold text-amber-400">{meal.carbs}g</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <span className="block text-[10px] text-slate-400">Tuky</span>
                      <span className="font-bold text-rose-400">{meal.fat}g</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleAddMeal(meal)}
                    disabled={isJustAdded}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                      isJustAdded
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Úspěšně zapsáno do deníku!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Rychle zapsat do dnešního deníku</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab 2: AI Chef (Generator from fridge ingredients) */}
      {activeSubTab === 'ai_chef' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateAiRecipe} className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-emerald-400" />
                Vymyslet recept na míru podle toho, co máš v lednici
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Napiš suroviny, které máš doma, a náš kulinářský asistent navrhne recept odpovídající tvým zbývajícím kaloriím ({analysis.caloriesRemaining} kcal).
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="fridge-ingredients" className="block text-xs font-semibold text-slate-300 mb-1">
                  Co máš k dispozici v lednici / spíži?
                </label>
                <textarea
                  id="fridge-ingredients"
                  rows={2}
                  placeholder="Např. kuřecí prsa, vejce, rýže basmati, brokolice, rajčata, sýr..."
                  value={fridgeIngredients}
                  onChange={(e) => setFridgeIngredients(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="dietary-notes" className="block text-xs font-semibold text-slate-300 mb-1">
                  Zvláštní přání / preference (volitelné)
                </label>
                <input
                  id="dietary-notes"
                  type="text"
                  placeholder="Např. rychlé do 15 min, lehce stravitelné, bez laktózy..."
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAi}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Sestavuji vyvážený recept...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Vygenerovat recept na míru</span>
                </>
              )}
            </button>
          </form>

          {/* Generated AI Recipe Result */}
          {aiRecipe && (
            <div className="bg-slate-850 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {aiRecipe.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-400" /> Čas přípravy: {aiRecipe.preparationTimeMin} minut
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white font-heading">
                  {aiRecipe.title}
                </h3>
                <p className="text-sm text-slate-200 mt-1">
                  {aiRecipe.description}
                </p>
              </div>

              {/* Nutritional breakdown */}
              <div className="grid grid-cols-5 gap-2 p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs">
                <div className="p-1">
                  <span className="block text-[10px] text-slate-400">Kalorie</span>
                  <span className="font-extrabold text-emerald-400 text-base">{aiRecipe.calories} kcal</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-400">Bílkoviny</span>
                  <span className="font-bold text-sky-400 text-base">{aiRecipe.protein}g</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-400">Sacharidy</span>
                  <span className="font-bold text-amber-400 text-base">{aiRecipe.carbs}g</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-400">Tuky</span>
                  <span className="font-bold text-rose-400 text-base">{aiRecipe.fat}g</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-400">Vláknina</span>
                  <span className="font-bold text-emerald-300 text-base">{aiRecipe.fiber || 3}g</span>
                </div>
              </div>

              {/* Ingredients & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-teal-400 mb-2">
                    Potřebné suroviny:
                  </h4>
                  <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                    {aiRecipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-400 mb-2">
                    Proč je jídlo ideální:
                  </h4>
                  <p className="text-xs text-slate-300">
                    {aiRecipe.whyRecommended}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleAddMeal(aiRecipe)}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Přidat tento recept do dnešního deníku</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
