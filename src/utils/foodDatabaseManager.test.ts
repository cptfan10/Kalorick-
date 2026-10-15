import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  addFoodToDatabase,
  updateFoodInDatabase,
  deleteFoodFromDatabase,
  restoreSingleDefaultFood,
  getDatabaseStats,
  filterAndSortFoodDatabase,
  repairFoodDatabase,
} from './foodDatabaseManager.ts';
import type { FoodItem } from '../types/nutrition.ts';

const SAMPLE_DATABASE: FoodItem[] = [
  {
    id: 'food_apple',
    name: 'Jablko',
    category: 'fruit_veg',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 14,
    fatPer100g: 0.2,
    fiberPer100g: 2.4,
    defaultPortionGrams: 150,
    servingUnit: 'ks (150g)',
    isFavorite: true,
  },
  {
    id: 'food_chicken',
    name: 'Kuřecí prsa',
    brand: 'Vodňanské kuře',
    barcode: '8594008270010',
    category: 'meat_fish',
    caloriesPer100g: 120,
    proteinPer100g: 23.5,
    carbsPer100g: 0,
    fatPer100g: 2.2,
    fiberPer100g: 0,
    defaultPortionGrams: 150,
    servingUnit: 'g',
  },
  {
    id: 'food_custom_shake',
    name: 'Můj Proteinový Shake',
    category: 'custom',
    caloriesPer100g: 95,
    proteinPer100g: 18,
    carbsPer100g: 4,
    fatPer100g: 1.5,
    fiberPer100g: 0.5,
    defaultPortionGrams: 300,
    servingUnit: 'porce',
    isCustom: true,
  },
];

describe('foodDatabaseManager', () => {
  it('updates an existing food item with modified values and sets isEdited flag', () => {
    const updated = updateFoodInDatabase(SAMPLE_DATABASE, {
      ...SAMPLE_DATABASE[1],
      caloriesPer100g: 125,
      proteinPer100g: 24.5,
      name: 'Kuřecí prsa bez kůže',
    });

    assert.strictEqual(updated.length, SAMPLE_DATABASE.length);
    const item = updated.find((f) => f.id === 'food_chicken');
    assert.ok(item);
    assert.strictEqual(item.name, 'Kuřecí prsa bez kůže');
    assert.strictEqual(item.caloriesPer100g, 125);
    assert.strictEqual(item.proteinPer100g, 24.5);
    assert.strictEqual(item.isEdited, true);
    assert.ok(item.updatedAt);
  });

  it('deletes a food item by ID regardless of whether it is default or custom', () => {
    const withoutChicken = deleteFoodFromDatabase(SAMPLE_DATABASE, 'food_chicken');
    assert.strictEqual(withoutChicken.length, SAMPLE_DATABASE.length - 1);
    assert.strictEqual(withoutChicken.some((f) => f.id === 'food_chicken'), false);

    const withoutCustom = deleteFoodFromDatabase(SAMPLE_DATABASE, 'food_custom_shake');
    assert.strictEqual(withoutCustom.length, SAMPLE_DATABASE.length - 1);
    assert.strictEqual(withoutCustom.some((f) => f.id === 'food_custom_shake'), false);
  });

  it('adds a new custom food item to the start of the database', () => {
    const newFood: FoodItem = {
      id: 'custom_snack',
      name: 'Proteinová tyčinka Malina',
      brand: 'Nutrend',
      barcode: '8594012345678',
      category: 'drinks_supplements',
      caloriesPer100g: 380,
      proteinPer100g: 30,
      carbsPer100g: 35,
      fatPer100g: 12,
      fiberPer100g: 8,
      defaultPortionGrams: 60,
      servingUnit: 'ks (60g)',
      isCustom: true,
    };

    const next = addFoodToDatabase(SAMPLE_DATABASE, newFood);
    assert.strictEqual(next.length, SAMPLE_DATABASE.length + 1);
    assert.strictEqual(next[0].id, 'custom_snack');
    assert.strictEqual(next[0].name, 'Proteinová tyčinka Malina');
  });

  it('restores a default food item to its factory defaults', () => {
    const modified: FoodItem[] = [
      {
        ...SAMPLE_DATABASE[1],
        caloriesPer100g: 999,
        isEdited: true,
      },
    ];

    const restored = restoreSingleDefaultFood(modified, SAMPLE_DATABASE, 'food_chicken');
    const chicken = restored.find((f) => f.id === 'food_chicken');
    assert.ok(chicken);
    assert.strictEqual(chicken.caloriesPer100g, 120);
    assert.strictEqual(chicken.isEdited, undefined);
  });

  it('computes database statistics correctly', () => {
    const withEdited: FoodItem[] = [
      ...SAMPLE_DATABASE,
      {
        id: 'food_bread',
        name: 'Žitný chléb',
        category: 'grains_bread',
        caloriesPer100g: 220,
        proteinPer100g: 7,
        carbsPer100g: 45,
        fatPer100g: 1.5,
        fiberPer100g: 6,
        defaultPortionGrams: 50,
        servingUnit: 'krajíc',
        isEdited: true,
      },
    ];

    const stats = getDatabaseStats(withEdited);
    assert.strictEqual(stats.total, 4);
    assert.strictEqual(stats.custom, 1);
    assert.strictEqual(stats.edited, 1);
    assert.strictEqual(stats.favorites, 1);
  });

  it('filters by search query and category correctly', () => {
    const results = filterAndSortFoodDatabase(SAMPLE_DATABASE, {
      query: 'kuře',
      category: 'all',
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 'food_chicken');

    const byBarcode = filterAndSortFoodDatabase(SAMPLE_DATABASE, {
      query: '8594008270010',
      category: 'all',
    });
    assert.strictEqual(byBarcode.length, 1);
    assert.strictEqual(byBarcode[0].id, 'food_chicken');

    const favorites = filterAndSortFoodDatabase(SAMPLE_DATABASE, {
      category: 'favorites',
    });
    assert.strictEqual(favorites.length, 1);
    assert.strictEqual(favorites[0].id, 'food_apple');

    const customs = filterAndSortFoodDatabase(SAMPLE_DATABASE, {
      category: 'custom',
    });
    assert.strictEqual(customs.length, 1);
    assert.strictEqual(customs[0].id, 'food_custom_shake');
  });

  it('sorts foods by calories and protein correctly', () => {
    const sortedByCalDesc = filterAndSortFoodDatabase(SAMPLE_DATABASE, {
      sortBy: 'calories_desc',
    });
    assert.strictEqual(sortedByCalDesc[0].id, 'food_chicken'); // 120
    assert.strictEqual(sortedByCalDesc[1].id, 'food_custom_shake'); // 95
    assert.strictEqual(sortedByCalDesc[2].id, 'food_apple'); // 52

    const sortedByCalAsc = filterAndSortFoodDatabase(SAMPLE_DATABASE, {
      sortBy: 'calories_asc',
    });
    assert.strictEqual(sortedByCalAsc[0].id, 'food_apple'); // 52
    assert.strictEqual(sortedByCalAsc[2].id, 'food_chicken'); // 120
  });

  it('repairs corrupted or missing food items, removes duplicates, and fixes invalid numbers', () => {
    const corruptedDatabase: any[] = [
      {
        id: 'food_corrupted',
        name: '',
        category: null,
        caloriesPer100g: -50,
        proteinPer100g: 20,
        carbsPer100g: 'not-a-number',
        fatPer100g: 5,
        fiberPer100g: null,
        defaultPortionGrams: 0,
        servingUnit: '',
      },
      // Duplicate ID
      {
        id: 'food_apple',
        name: 'Jablko 1',
        caloriesPer100g: 50,
      },
      {
        id: 'food_apple',
        name: 'Jablko 2',
        caloriesPer100g: 55,
      },
    ];

    const result = repairFoodDatabase(corruptedDatabase, SAMPLE_DATABASE);

    // Duplicates removed
    assert.strictEqual(result.removedDuplicatesCount, 1);
    // Both corrupted item and incomplete duplicate were fixed/sanitized
    assert.strictEqual(result.fixedItemsCount, 2);
    const fixedItem = result.repairedDatabase.find((f) => f.id === 'food_corrupted');
    assert.ok(fixedItem);
    assert.strictEqual(fixedItem.name, 'Položka bez názvu');
    assert.strictEqual(fixedItem.category, 'other');
    assert.strictEqual(fixedItem.carbsPer100g, 0);
    // Calculated calories from 20g protein + 5g fat = 80 + 45 = 125
    assert.strictEqual(fixedItem.caloriesPer100g, 125);
    assert.strictEqual(fixedItem.defaultPortionGrams, 100);
    assert.strictEqual(fixedItem.servingUnit, 'g');

    // Missing default foods restored (chicken and custom shake was missing)
    assert.ok(result.restoredDefaultsCount >= 2);
    assert.ok(result.repairedDatabase.some((f) => f.id === 'food_chicken'));
  });
});
