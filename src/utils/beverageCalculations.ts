import type { FoodItem, MealEntry } from '../types/nutrition.ts';

export type VolumeUnit = 'ml' | 'l' | 'dl' | 'g';

/**
 * Converts any volume or weight unit into base amount (ml or g, which is the 100g/100ml basis for nutrient tables).
 * Examples:
 * - 0.5 l -> 500 ml
 * - 1.5 l -> 1500 ml
 * - 2 dl  -> 200 ml
 * - 250 ml -> 250 ml
 * - 150 g  -> 150 g
 */
export function convertVolumeToBaseUnits(amount: number, unit: string): number {
  const normalized = (unit || '').trim().toLowerCase();
  
  if (normalized === 'l' || normalized === 'litr' || normalized === 'litry' || normalized === 'litrů') {
    return Math.round(amount * 1000 * 10) / 10;
  }
  if (normalized === 'dl' || normalized === 'dcl' || normalized === 'decilitr') {
    return Math.round(amount * 100 * 10) / 10;
  }
  return Math.round(amount * 10) / 10;
}

/**
 * Determines whether a food item or logged meal represents a liquid / beverage.
 */
export function isBeverage(item: Partial<FoodItem> | Partial<MealEntry>): boolean {
  if (item.category === 'drinks_supplements') return true;

  const unit = ((item as FoodItem).servingUnit || (item as MealEntry).portionUnit || '').toLowerCase();
  if (
    unit === 'ml' ||
    unit === 'l' ||
    unit === 'dl' ||
    unit.includes('ml') ||
    unit.includes('litr') ||
    unit.includes('sklenice') ||
    unit.includes('hrnek') ||
    unit.includes('šálek') ||
    unit.includes('láhev') ||
    unit.includes('plechovka')
  ) {
    return true;
  }

  const name = (item.name || '').toLowerCase();
  const drinkKeywords = [
    'voda', 'minerálka', 'čaj', 'káva', 'espresso', 'cappuccino', 'latte',
    'džus', 'mošt', 'kola', 'cola', 'kofola', 'limonáda', 'birell',
    'pivo', 'víno', 'mléko', 'shake', 'sirup', 'smoothie', 'šťáva'
  ];
  return drinkKeywords.some((kw) => name.includes(kw));
}

/**
 * Formats portion display clearly for both metric weights and fluid volumes (l, dl, ml, g).
 */
export function formatFluidPortion(baseAmountMlOrG: number, enteredUnit: string): string {
  const u = (enteredUnit || 'g').trim().toLowerCase();

  // If user entered in liters (e.g., 0.5 l or 1.5 l)
  if (u === 'l' || u === 'litr' || u === 'litry') {
    const liters = baseAmountMlOrG >= 10 ? Math.round((baseAmountMlOrG / 1000) * 100) / 100 : baseAmountMlOrG;
    const ml = Math.round(liters * 1000);
    return `${liters} l (${ml} ml)`;
  }

  if (u === 'dl') {
    const dl = baseAmountMlOrG >= 10 ? Math.round((baseAmountMlOrG / 100) * 10) / 10 : baseAmountMlOrG;
    const ml = Math.round(dl * 100);
    return `${dl} dl (${ml} ml)`;
  }

  if (u === 'ml') {
    if (baseAmountMlOrG >= 1000 && baseAmountMlOrG % 50 === 0) {
      const liters = Math.round((baseAmountMlOrG / 1000) * 100) / 100;
      return `${baseAmountMlOrG} ml (${liters} l)`;
    }
    return `${baseAmountMlOrG} ml`;
  }

  return `${baseAmountMlOrG} ${enteredUnit}`;
}

/**
 * Calculates total fluids in ml from a list of meal entries.
 */
export function calculateBeverageFluids(meals: MealEntry[]): number {
  return meals.reduce((sum, meal) => {
    if (isBeverage(meal)) {
      return sum + (meal.portionGrams || 0);
    }
    return sum;
  }, 0);
}
