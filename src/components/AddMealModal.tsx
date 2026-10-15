import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Star, Check, Flame, ChevronRight, Sparkles, ScanBarcode, Edit3 } from 'lucide-react';
import { FoodCategory, FoodItem, MealType } from '../types/nutrition.ts';
import { CATEGORY_LABELS } from '../data/defaultFoodDatabase.ts';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  foodDatabase: FoodItem[];
  onAddMeal: (params: {
    foodItem: FoodItem;
    portionGrams: number;
    portionUnit: string;
    mealType: MealType;
  }) => void;
  onOpenCustomFoodModal: () => void;
  onEditFood?: (food: FoodItem) => void;
  onToggleFavorite: (foodId: string) => void;
  onOpenBarcodeScanner?: () => void;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  snidane: 'Snídaně',
  svacina_dopoledne: 'Dopolední svačina',
  obed: 'Oběd',
  svacina_odpoledne: 'Odpolední svačina',
  vecere: 'Večeře',
  druha_vecere: 'Druhá večeře / Večerní mlsání',
};

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  mealType,
  foodDatabase,
  onAddMeal,
  onOpenCustomFoodModal,
  onEditFood,
  onToggleFavorite,
  onOpenBarcodeScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionInput, setPortionInput] = useState<string>('100');

  // Filter foods
  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((food) => {
      const matchQuery =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchQuery) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'favorites') return food.isFavorite;
      if (selectedCategory === 'custom') return food.isCustom;
      return food.category === selectedCategory;
    });
  }, [foodDatabase, searchQuery, selectedCategory]);

  const portionGrams = Math.max(1, parseFloat(portionInput) || 100);

  const previewMacros = useMemo(() => {
    if (!selectedFood) return null;
    const ratio = portionGrams / 100;
    return {
      calories: Math.round(selectedFood.caloriesPer100g * ratio),
      protein: Math.round(selectedFood.proteinPer100g * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbsPer100g * ratio * 10) / 10,
      fat: Math.round(selectedFood.fatPer100g * ratio * 10) / 10,
      fiber: Math.round(selectedFood.fiberPer100g * ratio * 10) / 10,
    };
  }, [selectedFood, portionGrams]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setPortionInput(String(food.defaultPortionGrams || 100));
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    onAddMeal({
      foodItem: selectedFood,
      portionGrams,
      portionUnit: selectedFood.servingUnit || 'g',
      mealType,
    });
    setSelectedFood(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-meal-title"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h2 id="add-meal-title" className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Zapsat jídlo: <span className="text-emerald-400">{MEAL_TYPE_LABELS[mealType]}</span>
            </h2>
            <p className="text-xs text-slate-400">Vyhledej potravinu v databázi nebo přidej vlastní</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Zavřít okno"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/60">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Hledat potravinu (např. kuřecí, ovesné vločky, vejce, jablko...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {onOpenBarcodeScanner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBarcodeScanner();
                }}
                title="Skenovat čárový kód"
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <ScanBarcode className="w-4 h-4" />
                <span className="hidden sm:inline">Skenovat kód</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Vše ({foodDatabase.length})
            </button>

            <button
              onClick={() => setSelectedCategory('favorites')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'favorites'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Oblíbené
            </button>

            <button
              onClick={() => setSelectedCategory('meat_fish')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'meat_fish' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Maso & Ryby
            </button>

            <button
              onClick={() => setSelectedCategory('dairy_eggs')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'dairy_eggs' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Mléčné & Vejce
            </button>

            <button
              onClick={() => setSelectedCategory('grains_bread')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'grains_bread' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Přílohy & Pečivo
            </button>

            <button
              onClick={() => setSelectedCategory('fruit_veg')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'fruit_veg' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Ovoce & Zelenina
            </button>

            <button
              onClick={() => setSelectedCategory('custom')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'custom' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Vlastní
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredFoods.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-slate-400 text-sm">Žádná potravina neodpovídá hledání „{searchQuery}“.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCustomFoodModal();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" /> Vytvořit vlastní potravinu
              </button>
            </div>
          ) : (
            filteredFoods.map((food) => {
              const isChosen = selectedFood?.id === food.id;
              return (
                <div
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChosen
                      ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm truncate">{food.name}</span>
                      {food.isCustom && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          Vlastní
                        </span>
                      )}
                      {food.brand && (
                        <span className="text-xs text-slate-400 truncate">({food.brand})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="text-emerald-400 font-semibold">{food.caloriesPer100g} kcal / 100g</span>
                      <span>B: <strong className="text-slate-300">{food.proteinPer100g}g</strong></span>
                      <span>S: <strong className="text-slate-300">{food.carbsPer100g}g</strong></span>
                      <span>T: <strong className="text-slate-300">{food.fatPer100g}g</strong></span>
                      {food.fiberPer100g > 0 && (
                        <span>Vl: <strong className="text-slate-300">{food.fiberPer100g}g</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onEditFood && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onEditFood(food);
                        }}
                        title="Upravit hodnoty této potraviny v databázi"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-slate-700/60 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(food.id);
                      }}
                      title={food.isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        food.isFavorite
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${food.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isChosen ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700/60 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}>
                      {isChosen ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Portion Calculation Panel (When Food is Selected) */}
        {selectedFood && previewMacros && (
          <div className="p-4 bg-slate-850 border-t border-slate-700/80 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Vybraná porce</span>
                <h4 className="text-sm font-bold text-white truncate max-w-sm">{selectedFood.name}</h4>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="portion-input" className="text-xs text-slate-400 whitespace-nowrap">Množství:</label>
                <div className="relative w-28">
                  <input
                    id="portion-input"
                    type="number"
                    min="1"
                    max="5000"
                    value={portionInput}
                    onChange={(e) => setPortionInput(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    g
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Portion Buttons */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px]">Rychlá volba:</span>
              {[50, 100, 150, 200, 250].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPortionInput(String(amt))}
                  className={`px-2 py-0.5 rounded border ${
                    portionGrams === amt
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {amt}g
                </button>
              ))}
              {selectedFood.defaultPortionGrams && selectedFood.defaultPortionGrams !== 100 && (
                <button
                  type="button"
                  onClick={() => setPortionInput(String(selectedFood.defaultPortionGrams))}
                  className="px-2 py-0.5 rounded border bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20"
                >
                  {selectedFood.servingUnit} ({selectedFood.defaultPortionGrams}g)
                </button>
              )}
            </div>

            {/* Calculated Macros Grid */}
            <div className="grid grid-cols-5 gap-2 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-center mb-3 text-xs">
              <div className="bg-slate-800/60 p-1.5 rounded-lg">
                <span className="block text-[10px] text-slate-400">Kalorie</span>
                <span className="font-extrabold text-emerald-400 text-sm">{previewMacros.calories} kcal</span>
              </div>
              <div className="bg-slate-800/60 p-1.5 rounded-lg">
                <span className="block text-[10px] text-slate-400">Bílkoviny</span>
                <span className="font-bold text-sky-400 text-sm">{previewMacros.protein}g</span>
              </div>
              <div className="bg-slate-800/60 p-1.5 rounded-lg">
                <span className="block text-[10px] text-slate-400">Sacharidy</span>
                <span className="font-bold text-amber-400 text-sm">{previewMacros.carbs}g</span>
              </div>
              <div className="bg-slate-800/60 p-1.5 rounded-lg">
                <span className="block text-[10px] text-slate-400">Tuky</span>
                <span className="font-bold text-rose-400 text-sm">{previewMacros.fat}g</span>
              </div>
              <div className="bg-slate-800/60 p-1.5 rounded-lg">
                <span className="block text-[10px] text-slate-400">Vláknina</span>
                <span className="font-bold text-emerald-300 text-sm">{previewMacros.fiber}g</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Zrušit výběr
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 max-w-xs flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Zapsat do {MEAL_TYPE_LABELS[mealType]}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer / Create custom food CTA */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Chybí ti potravina v seznamu?</span>
          <button
            onClick={() => {
              onClose();
              onOpenCustomFoodModal();
            }}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Vytvořit vlastní potravinu
          </button>
        </div>
      </div>
    </div>
  );
};
