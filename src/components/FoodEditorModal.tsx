import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Edit3, Trash2, Calculator, Info } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../types/nutrition.ts';
import { CATEGORY_LABELS } from '../data/defaultFoodDatabase.ts';

interface FoodEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFood: (food: FoodItem) => void;
  onDeleteFood?: (foodId: string) => void;
  foodToEdit?: FoodItem | null;
  initialBarcode?: string;
}

export const FoodEditorModal: React.FC<FoodEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveFood,
  onDeleteFood,
  foodToEdit,
  initialBarcode,
}) => {
  const isEditing = !!foodToEdit;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<FoodCategory>('custom');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [defaultPortion, setDefaultPortion] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync inputs when modal opens or foodToEdit changes
  useEffect(() => {
    if (foodToEdit) {
      setName(foodToEdit.name || '');
      setBrand(foodToEdit.brand || '');
      setBarcode(foodToEdit.barcode || '');
      setCategory(foodToEdit.category || 'custom');
      setCalories(String(foodToEdit.caloriesPer100g ?? ''));
      setProtein(String(foodToEdit.proteinPer100g ?? '0'));
      setCarbs(String(foodToEdit.carbsPer100g ?? '0'));
      setFat(String(foodToEdit.fatPer100g ?? '0'));
      setFiber(String(foodToEdit.fiberPer100g ?? '0'));
      setDefaultPortion(String(foodToEdit.defaultPortionGrams ?? '100'));
      setServingUnit(foodToEdit.servingUnit || 'g');
    } else {
      setName('');
      setBrand('');
      setBarcode(initialBarcode || '');
      setCategory('custom');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setFiber('');
      setDefaultPortion('100');
      setServingUnit('g');
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [foodToEdit, initialBarcode, isOpen]);

  if (!isOpen) return null;

  // Caloric check using 4-4-9 formula
  const pNum = parseFloat(protein) || 0;
  const cNum = parseFloat(carbs) || 0;
  const fNum = parseFloat(fat) || 0;
  const fibNum = parseFloat(fiber) || 0;
  const calculatedKcal = Math.round(pNum * 4 + cNum * 4 + fNum * 9);
  const enteredKcal = parseFloat(calories) || 0;
  const showKcalHint = enteredKcal > 0 && Math.abs(calculatedKcal - enteredKcal) > 30;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Zadejte prosím název potraviny');
      return;
    }
    const kcalVal = parseFloat(calories);
    if (isNaN(kcalVal) || kcalVal < 0) {
      setError('Zadejte platné kalorie na 100g (např. 150)');
      return;
    }

    const proteinVal = Math.max(0, parseFloat(protein) || 0);
    const carbsVal = Math.max(0, parseFloat(carbs) || 0);
    const fatVal = Math.max(0, parseFloat(fat) || 0);
    const fiberVal = Math.max(0, parseFloat(fiber) || 0);
    const portionVal = Math.max(1, parseFloat(defaultPortion) || 100);

    const savedFood: FoodItem = {
      id: foodToEdit ? foodToEdit.id : `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      brand: brand.trim() || undefined,
      barcode: barcode.trim() || undefined,
      category,
      caloriesPer100g: Math.round(kcalVal),
      proteinPer100g: Math.round(proteinVal * 10) / 10,
      carbsPer100g: Math.round(carbsVal * 10) / 10,
      fatPer100g: Math.round(fatVal * 10) / 10,
      fiberPer100g: Math.round(fiberVal * 10) / 10,
      defaultPortionGrams: Math.round(portionVal),
      servingUnit: servingUnit.trim() || 'g',
      isCustom: foodToEdit ? foodToEdit.isCustom : true,
      isEdited: foodToEdit ? (!foodToEdit.isCustom ? true : foodToEdit.isEdited) : false,
      isFavorite: foodToEdit ? foodToEdit.isFavorite : false,
      updatedAt: new Date().toISOString(),
    };

    onSaveFood(savedFood);
    onClose();
  };

  const handleDelete = () => {
    if (foodToEdit && onDeleteFood) {
      onDeleteFood(foodToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-editor-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-xl ${
                isEditing
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </span>
            <div>
              <h2 id="food-editor-title" className="text-lg font-bold text-white">
                {isEditing ? 'Upravit potravinu v databázi' : 'Přidat novou potravinu'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Změny se ihned uloží do vaší databáze a promítnou do vyhledávání.'
                  : 'Nutriční hodnoty zadávejte na 100 g / 100 ml výrobku.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Zavřít"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete confirmation banner inside modal */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-950/70 border-b border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-rose-200 text-xs">
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Opravdu si přejete smazat potravinu <strong>{name || 'tuto položku'}</strong> z databáze?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95"
              >
                Ano, smazat
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="food-name" className="text-xs font-semibold text-slate-200">
                Název potraviny <span className="text-emerald-400">*</span>
              </label>
              <input
                id="food-name"
                type="text"
                placeholder="Např. Odtučněný tvaroh, Kuřecí prsa, Žitný chléb..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="food-brand" className="text-xs font-semibold text-slate-200">
                Značka / Výrobce (volitelné)
              </label>
              <input
                id="food-brand"
                type="text"
                placeholder="Např. Madeta, GymBeam, Penam, Domácí..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="food-barcode"
                className="text-xs font-semibold text-slate-200 flex items-center justify-between"
              >
                <span>Čárový kód / EAN (volitelné)</span>
                {barcode && <span className="text-[10px] text-emerald-400 font-mono">EAN aktivní</span>}
              </label>
              <input
                id="food-barcode"
                type="text"
                placeholder="Např. 8594008270034"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="food-category" className="text-xs font-semibold text-slate-200">
                Kategorie
              </label>
              <select
                id="food-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="meat_fish">Maso, ryby a tofu</option>
                <option value="dairy_eggs">Mléčné výrobky a vejce</option>
                <option value="grains_bread">Pečivo a přílohy</option>
                <option value="legumes">Luštěniny</option>
                <option value="fruit_veg">Ovoce a zelenina</option>
                <option value="nuts_seeds_oils">Ořechy, semínka a oleje</option>
                <option value="drinks_supplements">Nápoje a proteiny</option>
                <option value="custom">Moje vlastní / Ostatní</option>
              </select>
            </div>
          </div>

          {/* Macro nutrients */}
          <div className="p-4 bg-slate-850/80 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-extrabold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                Nutriční hodnoty na 100 g / ml
              </span>
              {showKcalHint && (
                <span
                  title="Orientační součet ze zadaných makroživin (4 kcal/g bílkoviny, 4 kcal/g sacharidy, 9 kcal/g tuky)"
                  className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg cursor-help"
                >
                  Výpočet z maker: ~{calculatedKcal} kcal
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label htmlFor="food-kcal" className="text-xs font-semibold text-slate-300">
                  Kalorie (kcal) <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="food-kcal"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="250"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-emerald-400 font-black focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="food-protein" className="text-xs font-semibold text-slate-300">
                  Bílkoviny (g)
                </label>
                <input
                  id="food-protein"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="20"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-sky-400 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="food-carbs" className="text-xs font-semibold text-slate-300">
                  Sacharidy (g)
                </label>
                <input
                  id="food-carbs"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="15"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-amber-400 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="food-fat" className="text-xs font-semibold text-slate-300">
                  Tuky (g)
                </label>
                <input
                  id="food-fat"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="8"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-rose-400 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label htmlFor="food-fiber" className="text-xs font-semibold text-slate-300">
                  Vláknina (g)
                </label>
                <input
                  id="food-fiber"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="3"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-emerald-300 font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="food-portion" className="text-xs font-semibold text-slate-300">
                  Běžná porce (g / ml)
                </label>
                <input
                  id="food-portion"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={defaultPortion}
                  onChange={(e) => setDefaultPortion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="food-unit" className="text-xs font-semibold text-slate-300">
                  Jednotka porce
                </label>
                <input
                  id="food-unit"
                  type="text"
                  placeholder="g, ml, ks, porce..."
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <div>
              {isEditing && onDeleteFood && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Smazat tuto potravinu</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isEditing ? 'Uložit změny v databázi' : 'Přidat do databáze'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
