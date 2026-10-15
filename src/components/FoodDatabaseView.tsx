import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Star, 
  Trash2, 
  Database, 
  Check, 
  Flame, 
  Utensils,
  Edit3,
  RotateCcw,
  AlertTriangle,
  Barcode,
  Sparkles,
  SlidersHorizontal,
  X,
  FileCheck,
  Wrench,
  RefreshCw
} from 'lucide-react';
import type { FoodCategory, FoodItem } from '../types/nutrition.ts';
import { CATEGORY_LABELS, DEFAULT_FOOD_DATABASE } from '../data/defaultFoodDatabase.ts';
import { 
  filterAndSortFoodDatabase, 
  getDatabaseStats, 
  SortField 
} from '../utils/foodDatabaseManager.ts';
import type { ResetDatabaseMode } from '../utils/storage.ts';
import { isBeverage, formatFluidPortion } from '../utils/beverageCalculations.ts';

interface FoodDatabaseViewProps {
  foodDatabase: FoodItem[];
  onOpenCreateFoodModal: () => void;
  onEditFood: (food: FoodItem) => void;
  onDeleteFood: (foodId: string) => void;
  onRestoreSingleDefaultFood?: (foodId: string) => void;
  onResetDatabase: (mode: ResetDatabaseMode, resetTodayMeals?: boolean) => void;
  onToggleFavorite: (foodId: string) => void;
  onQuickLogFood: (food: FoodItem) => void;
}

export const FoodDatabaseView: React.FC<FoodDatabaseViewProps> = ({
  foodDatabase,
  onOpenCreateFoodModal,
  onEditFood,
  onDeleteFood,
  onRestoreSingleDefaultFood,
  onResetDatabase,
  onToggleFavorite,
  onQuickLogFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('name');

  // Confirmation dialogs
  const [foodToDelete, setFoodToDelete] = useState<FoodItem | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetMode, setResetMode] = useState<ResetDatabaseMode>('repair');
  const [resetTodayMeals, setResetTodayMeals] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const stats = useMemo(() => getDatabaseStats(foodDatabase), [foodDatabase]);

  const filteredFoods = useMemo(() => {
    return filterAndSortFoodDatabase(foodDatabase, {
      query: searchQuery,
      category: selectedFilter,
      sortBy,
    });
  }, [foodDatabase, searchQuery, selectedFilter, sortBy]);

  const handleConfirmDelete = () => {
    if (!foodToDelete) return;
    onDeleteFood(foodToDelete.id);
    showNotice(`Potravina "${foodToDelete.name}" byla úspěšně smazána z databáze.`);
    setFoodToDelete(null);
  };

  const handleConfirmReset = () => {
    onResetDatabase(resetMode, resetTodayMeals);
    setIsResetModalOpen(false);
    if (resetMode === 'factory_reset') {
      showNotice(
        resetTodayMeals
          ? 'Databáze byla vynulována do továrního stavu a dnešní deník byl vynulován na 0 kcal.'
          : 'Databáze byla kompletně vynulována do původního továrního stavu (53 ověřených položek).'
      );
    } else if (resetMode === 'clear_custom') {
      showNotice(
        resetTodayMeals
          ? 'Vlastní potraviny byly vynulovány a dnešní jídelníček byl vymazán.'
          : 'Všechny vaše vlastní vytvořené potraviny byly smazány.'
      );
    } else {
      showNotice(
        resetTodayMeals
          ? 'Databáze byla zkontrolována, opravena a doplněna. Dnešní jídelníček byl vynulován.'
          : 'Databáze byla úspěšně zkontrolována, opravena a doplněna o chybějící výchozí položky.'
      );
    }
  };

  const showNotice = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  // Check if a food is an original default item
  const isDefaultItem = (foodId: string) => {
    return DEFAULT_FOOD_DATABASE.some((d) => d.id === foodId);
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback notification */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-black/80 rounded-2xl px-5 py-3.5 flex items-center gap-3 text-emerald-300 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-white">{statusNotification}</span>
          <button
            onClick={() => setStatusNotification(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Main Actions */}
      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Database className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
              Správa nutriční databáze
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-heading">
            Databáze potravin & Editace položek
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Celkem <strong>{stats.total} položek</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">{stats.custom} vlastních</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-semibold">{stats.edited} upravených</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400 font-semibold">{stats.favorites} oblíbených</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsResetModalOpen(true)}
            title="Opravit nebo vynulovat databázi potravin"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 rounded-2xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-md"
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Opravit / Vynulovat</span>
          </button>

          <button
            onClick={onOpenCreateFoodModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Přidat novou potravinu</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Vyhledat v databázi dle názvu, značky nebo EAN čárového kódu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                title="Smazat hledání"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">Řadit dle:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="name">Názvu (A-Z)</option>
              <option value="calories_desc">Kalorií (od nejvyšších)</option>
              <option value="calories_asc">Kalorií (od nejnižších)</option>
              <option value="protein">Bílkovin (od nejvyšších)</option>
              <option value="carbs">Sacharidů (od nejvyšších)</option>
              <option value="fat">Tuků (od nejvyšších)</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-colors ${
              selectedFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Všechny ({stats.total})
          </button>

          <button
            onClick={() => setSelectedFilter('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-colors ${
              selectedFilter === 'custom'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Moje vlastní ({stats.custom})
          </button>

          <button
            onClick={() => setSelectedFilter('edited')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-colors ${
              selectedFilter === 'edited'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Upravené ({stats.edited})
          </button>

          <button
            onClick={() => setSelectedFilter('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-colors ${
              selectedFilter === 'favorites'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Oblíbené ({stats.favorites})
          </button>

          <div className="h-4 w-px bg-slate-700 my-auto mx-1 shrink-0" />

          {Object.entries(CATEGORY_LABELS)
            .filter(([k]) => k !== 'all' && k !== 'custom')
            .map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  selectedFilter === key
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {label}
              </button>
            ))}
        </div>
      </div>

      {/* Food Items Table / Cards */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-5">Potravina / Značka / Kód</div>
          <div className="col-span-2 text-right">Kcal / 100g</div>
          <div className="col-span-3 text-center">Bílkoviny / Sacharidy / Tuky / Vláknina</div>
          <div className="col-span-2 text-right">Možnosti editace & Zápis</div>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredFoods.length === 0 ? (
            <div className="py-14 px-6 text-center text-slate-400 text-sm space-y-3">
              <Database className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base text-slate-300 font-semibold">
                Nenalezena žádná potravina pro zvolená kritéria.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Zkuste upravit vyhledávací dotaz, přepnout kategorii na „Všechny“ nebo vytvořit novou položku.
              </p>
              <button
                onClick={onOpenCreateFoodModal}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Vytvořit novou potravinu</span>
              </button>
            </div>
          ) : (
            filteredFoods.map((food) => (
              <div
                key={food.id}
                className="p-4 sm:px-5 sm:py-3.5 flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-3 hover:bg-slate-800/40 transition-colors"
              >
                {/* Food Name, Brand, Badges */}
                <div className="lg:col-span-5 flex items-start sm:items-center gap-2.5">
                  <button
                    onClick={() => onToggleFavorite(food.id)}
                    title={food.isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
                    className={`p-1.5 rounded-lg transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                      food.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${food.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base">{food.name}</span>
                      
                      {food.isCustom && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                          Vlastní
                        </span>
                      )}
                      
                      {food.isEdited && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
                          Upraveno
                        </span>
                      )}

                      {food.brand && (
                        <span className="text-xs text-slate-400 font-medium bg-slate-800/80 px-2 py-0.5 rounded-md">
                          {food.brand}
                        </span>
                      )}

                      {food.barcode && (
                        <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          {food.barcode}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>Běžná porce: <strong>{food.defaultPortionGrams} {food.servingUnit}</strong></span>
                      {food.category && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{CATEGORY_LABELS[food.category] || food.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calories */}
                <div className="lg:col-span-2 lg:text-right flex lg:block items-baseline gap-2">
                  <span className="text-xs text-slate-400 lg:hidden">Energie:</span>
                  <span className="font-black text-emerald-400 text-base sm:text-lg">
                    {food.caloriesPer100g}{' '}
                    <span className="text-xs font-normal text-slate-400">kcal / 100g</span>
                  </span>
                </div>

                {/* Macro breakdown */}
                <div className="lg:col-span-3 flex flex-wrap lg:justify-center items-center gap-1.5 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20" title="Bílkoviny">
                    B: <strong>{food.proteinPer100g}g</strong>
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20" title="Sacharidy">
                    S: <strong>{food.carbsPer100g}g</strong>
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20" title="Tuky">
                    T: <strong>{food.fatPer100g}g</strong>
                  </span>
                  {food.fiberPer100g > 0 && (
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" title="Vláknina">
                      Vl: <strong>{food.fiberPer100g}g</strong>
                    </span>
                  )}
                </div>

                {/* Actions: Edit, Delete, Restore, Quick Log */}
                <div className="lg:col-span-2 flex items-center justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <button
                    onClick={() => onQuickLogFood(food)}
                    title="Zapsat potravinu do deníku"
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Zapsat</span>
                  </button>

                  <button
                    onClick={() => onEditFood(food)}
                    title="Upravit hodnoty nebo název této potraviny"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upravit</span>
                  </button>

                  {food.isEdited && isDefaultItem(food.id) && onRestoreSingleDefaultFood && (
                    <button
                      onClick={() => onRestoreSingleDefaultFood(food.id)}
                      title="Vrátit původní výchozí hodnoty této potraviny"
                      className="p-1.5 text-cyan-400 hover:bg-cyan-500/15 border border-cyan-500/30 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setFoodToDelete(food)}
                    title="Smazat tuto potravinu z databáze"
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Food Confirmation Modal */}
      {foodToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Smazat potravinu z databáze?</h3>
                <p className="text-xs text-slate-400">Tato akce položku odstraní z katalogu potravin</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-1">
              <p className="text-sm font-bold text-white">{foodToDelete.name}</p>
              {foodToDelete.brand && (
                <p className="text-xs text-slate-400">Značka: {foodToDelete.brand}</p>
              )}
              <p className="text-xs text-emerald-400 font-semibold">
                {foodToDelete.caloriesPer100g} kcal / 100g • {foodToDelete.defaultPortionGrams} {foodToDelete.servingUnit}
              </p>
            </div>

            <p className="text-xs text-slate-300">
              Již dříve zapsaná jídla v deníku zůstanou zachována. Pokud smažete výchozí potravinu, můžete ji kdykoliv později vrátit tlačítkem „Opravit / Vynulovat“.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFoodToDelete(null)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-rose-950/40 transition-all active:scale-95 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ano, smazat potravinu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Reset / Restore Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-2xl">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Oprava & Vynulování databáze</h3>
                <p className="text-xs text-slate-400">Vyberte úroveň opravy nebo kompletního vynulování databáze</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option 1: Repair (Doporučeno) */}
              <label
                onClick={() => setResetMode('repair')}
                className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                  resetMode === 'repair' || resetMode === 'restore_missing'
                    ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/40'
                    : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="resetMode"
                    checked={resetMode === 'repair' || resetMode === 'restore_missing'}
                    onChange={() => setResetMode('repair')}
                    className="mt-1 text-cyan-500 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      Opravit databázi & doplnit chybějící
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full">
                        Doporučeno
                      </span>
                    </span>
                    <span className="text-xs text-slate-300 block mt-1 leading-relaxed">
                      Zkontroluje integritu, opraví poškozená čísla, odstraní duplicity a doplní všechny výchozí potraviny katalogu. Vaše vlastní potraviny ({stats.custom}) i úpravy zůstanou zachovány.
                    </span>
                  </div>
                </div>
              </label>

              {/* Option 2: Factory Reset / Vynulovat */}
              <label
                onClick={() => setResetMode('factory_reset')}
                className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                  resetMode === 'factory_reset'
                    ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40'
                    : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="resetMode"
                    checked={resetMode === 'factory_reset'}
                    onChange={() => setResetMode('factory_reset')}
                    className="mt-1 text-rose-500 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-2">
                      Vynulovat databázi (Kompletní tovární reset)
                    </span>
                    <span className="text-xs text-slate-400 block mt-1 leading-relaxed">
                      Vynuluje celou databázi na čistý oficiální katalog ({DEFAULT_FOOD_DATABASE.length} ověřených potravin). Smaže všechny vaše úpravy a vlastní přidané potraviny.
                    </span>
                  </div>
                </div>
              </label>

              {/* Option 3: Clear Custom Only */}
              <label
                onClick={() => setResetMode('clear_custom')}
                className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                  resetMode === 'clear_custom'
                    ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40'
                    : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="resetMode"
                    checked={resetMode === 'clear_custom'}
                    onChange={() => setResetMode('clear_custom')}
                    className="mt-1 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      Vynulovat pouze vlastní vytvořené potraviny
                    </span>
                    <span className="text-xs text-slate-400 block mt-1 leading-relaxed">
                      Odstraní pouze vámi vytvořené položky ({stats.custom}) a ponechá původní oficiální katalog.
                    </span>
                  </div>
                </div>
              </label>

              {/* Optional checkbox: Reset today's diary meals to 0 kcal */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={resetTodayMeals}
                    onChange={(e) => setResetTodayMeals(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30"
                  />
                  <span>Vynulovat také snědené kalorie na dnešek (vymazat dnešní deník jídel na 0 kcal)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-950/40 transition-all active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {resetMode === 'factory_reset' ? 'Vynulovat databázi' : 'Provést opravu / reset'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
