import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  convertVolumeToBaseUnits,
  isBeverage,
  formatFluidPortion,
  calculateBeverageFluids,
} from './beverageCalculations.ts';
import type { MealEntry } from '../types/nutrition.ts';

describe('beverageCalculations', () => {
  it('converts liters, deciliters, milliliters, and grams correctly to base units', () => {
    // Liters
    assert.strictEqual(convertVolumeToBaseUnits(1, 'l'), 1000);
    assert.strictEqual(convertVolumeToBaseUnits(0.5, 'l'), 500);
    assert.strictEqual(convertVolumeToBaseUnits(1.5, 'litr'), 1500);
    assert.strictEqual(convertVolumeToBaseUnits(2, 'litry'), 2000);

    // Deciliters
    assert.strictEqual(convertVolumeToBaseUnits(2, 'dl'), 200);
    assert.strictEqual(convertVolumeToBaseUnits(3.5, 'dl'), 350);

    // Milliliters and grams
    assert.strictEqual(convertVolumeToBaseUnits(250, 'ml'), 250);
    assert.strictEqual(convertVolumeToBaseUnits(100, 'g'), 100);
  });

  it('identifies beverage items accurately by category, unit, or name', () => {
    assert.strictEqual(isBeverage({ category: 'drinks_supplements', name: 'Něco' }), true);
    assert.strictEqual(isBeverage({ name: 'Čerstvý pomerančový džus', servingUnit: 'ml' }), true);
    assert.strictEqual(isBeverage({ name: 'Pramenitá voda', servingUnit: 'sklenice (250 ml)' }), true);
    assert.strictEqual(isBeverage({ name: 'Birell nealko', servingUnit: 'plechovka' }), true);
    assert.strictEqual(isBeverage({ name: 'Hovězí steak', servingUnit: 'g', category: 'meat_fish' }), false);
  });

  it('formats fluid portions in clear Czech metric representations', () => {
    assert.strictEqual(formatFluidPortion(500, 'l'), '0.5 l (500 ml)');
    assert.strictEqual(formatFluidPortion(1000, 'l'), '1 l (1000 ml)');
    assert.strictEqual(formatFluidPortion(250, 'ml'), '250 ml');
    assert.strictEqual(formatFluidPortion(1500, 'ml'), '1500 ml (1.5 l)');
    assert.strictEqual(formatFluidPortion(200, 'g'), '200 g');
  });

  it('aggregates total beverage fluid intake across meals', () => {
    const meals: MealEntry[] = [
      {
        id: '1',
        foodId: 'food_water',
        name: 'Voda pitná',
        portionGrams: 500,
        portionUnit: 'ml',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        mealType: 'snidane',
        timeStr: '08:00',
      },
      {
        id: '2',
        foodId: 'food_chicken',
        name: 'Kuřecí prsa',
        portionGrams: 150,
        portionUnit: 'g',
        calories: 180,
        protein: 35,
        carbs: 0,
        fat: 3,
        fiber: 0,
        mealType: 'obed',
        timeStr: '12:30',
      },
      {
        id: '3',
        foodId: 'food_juice',
        name: 'Pomerančový džus',
        portionGrams: 250,
        portionUnit: 'ml',
        calories: 110,
        protein: 1.5,
        carbs: 25,
        fat: 0.5,
        fiber: 0.5,
        mealType: 'obed',
        timeStr: '12:30',
      },
    ];

    const totalFluids = calculateBeverageFluids(meals);
    // 500ml water + 250ml juice = 750ml (excludes 150g chicken)
    assert.strictEqual(totalFluids, 750);
  });
});
