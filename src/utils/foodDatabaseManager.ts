import type { FoodCategory, FoodItem } from '../types/nutrition.ts';

export interface DatabaseStats {
  total: number;
  custom: number;
  edited: number;
  favorites: number;
}

export type SortField = 'name' | 'calories_desc' | 'calories_asc' | 'protein' | 'carbs' | 'fat';

export interface FilterSortOptions {
  query?: string;
  category?: string; // 'all' | 'custom' | 'edited' | 'favorites' | specific FoodCategory
  sortBy?: SortField;
}

export interface DatabaseRepairResult {
  repairedDatabase: FoodItem[];
  fixedItemsCount: number;
  restoredDefaultsCount: number;
  removedDuplicatesCount: number;
}

/**
 * Validates, repairs and sanitizes food items in the database:
 * 1. Deduplicates food items by ID.
 * 2. Sanitizes invalid numbers (NaN, negative calories or macros).
 * 3. Ensures valid portion unit and category.
 * 4. Restores any missing original default food items.
 */
export function repairFoodDatabase(
  database: FoodItem[],
  defaultDatabase: FoodItem[]
): DatabaseRepairResult {
  let fixedItemsCount = 0;
  let removedDuplicatesCount = 0;
  let restoredDefaultsCount = 0;

  const seenIds = new Set<string>();
  const sanitizedList: FoodItem[] = [];

  for (const item of database) {
    if (!item || !item.id) {
      fixedItemsCount++;
      continue;
    }

    if (seenIds.has(item.id)) {
      removedDuplicatesCount++;
      continue;
    }
    seenIds.add(item.id);

    let wasFixed = false;
    const sanitized: FoodItem = { ...item };

    // Sanitize name
    if (!sanitized.name || typeof sanitized.name !== 'string' || sanitized.name.trim() === '') {
      sanitized.name = 'Položka bez názvu';
      wasFixed = true;
    }

    // Sanitize numbers
    const cleanNumber = (val: unknown, fallback = 0) => {
      const num = Number(val);
      if (isNaN(num) || !isFinite(num) || num < 0) {
        wasFixed = true;
        return fallback;
      }
      return Math.round(num * 10) / 10;
    };

    sanitized.proteinPer100g = cleanNumber(sanitized.proteinPer100g, 0);
    sanitized.carbsPer100g = cleanNumber(sanitized.carbsPer100g, 0);
    sanitized.fatPer100g = cleanNumber(sanitized.fatPer100g, 0);
    sanitized.fiberPer100g = cleanNumber(sanitized.fiberPer100g, 0);

    const rawCals = Number(sanitized.caloriesPer100g);
    if (isNaN(rawCals) || !isFinite(rawCals) || rawCals <= 0) {
      // Calculate from macros (Atwater)
      sanitized.caloriesPer100g = Math.round(
        sanitized.proteinPer100g * 4 + sanitized.carbsPer100g * 4 + sanitized.fatPer100g * 9
      );
      wasFixed = true;
    } else {
      sanitized.caloriesPer100g = Math.round(rawCals);
    }

    if (!sanitized.defaultPortionGrams || sanitized.defaultPortionGrams <= 0) {
      sanitized.defaultPortionGrams = 100;
      wasFixed = true;
    }

    if (!sanitized.servingUnit) {
      sanitized.servingUnit = 'g';
      wasFixed = true;
    }

    if (!sanitized.category) {
      sanitized.category = 'other';
      wasFixed = true;
    }

    if (wasFixed) {
      fixedItemsCount++;
    }

    sanitizedList.push(sanitized);
  }

  // Restore missing defaults
  for (const def of defaultDatabase) {
    if (!seenIds.has(def.id)) {
      sanitizedList.push({ ...def });
      restoredDefaultsCount++;
      seenIds.add(def.id);
    }
  }

  return {
    repairedDatabase: sanitizedList,
    fixedItemsCount,
    restoredDefaultsCount,
    removedDuplicatesCount,
  };
}

/**
 * Updates an existing food item or prepends if not existing.
 * Automatically marks isEdited = true if it was not custom.
 */
export function updateFoodInDatabase(
  database: FoodItem[],
  updatedFood: FoodItem
): FoodItem[] {
  const existingIndex = database.findIndex((f) => f.id === updatedFood.id);
  const now = new Date().toISOString();

  const preparedFood: FoodItem = {
    ...updatedFood,
    isEdited: !updatedFood.isCustom ? true : updatedFood.isEdited,
    updatedAt: now,
  };

  if (existingIndex === -1) {
    return [preparedFood, ...database];
  }

  const next = [...database];
  next[existingIndex] = preparedFood;
  return next;
}

/**
 * Removes a food item by ID from the database.
 */
export function deleteFoodFromDatabase(
  database: FoodItem[],
  foodId: string
): FoodItem[] {
  return database.filter((f) => f.id !== foodId);
}

/**
 * Adds a new food item to the database (prepended).
 */
export function addFoodToDatabase(
  database: FoodItem[],
  newFood: FoodItem
): FoodItem[] {
  // If item already exists with this id, update it
  const existing = database.find((f) => f.id === newFood.id);
  if (existing) {
    return updateFoodInDatabase(database, newFood);
  }
  return [newFood, ...database];
}

/**
 * Restores a single default food item to its factory defaults if present in defaultDatabase.
 */
export function restoreSingleDefaultFood(
  database: FoodItem[],
  defaultDatabase: FoodItem[],
  foodId: string
): FoodItem[] {
  const defaultItem = defaultDatabase.find((f) => f.id === foodId);
  if (!defaultItem) return database;

  const existingIndex = database.findIndex((f) => f.id === foodId);
  if (existingIndex === -1) {
    return [...database, { ...defaultItem }];
  }

  const next = [...database];
  next[existingIndex] = { ...defaultItem };
  return next;
}

/**
 * Calculates counts for all food types in the database.
 */
export function getDatabaseStats(database: FoodItem[]): DatabaseStats {
  let custom = 0;
  let edited = 0;
  let favorites = 0;

  for (const food of database) {
    if (food.isCustom) custom++;
    if (food.isEdited) edited++;
    if (food.isFavorite) favorites++;
  }

  return {
    total: database.length,
    custom,
    edited,
    favorites,
  };
}

/**
 * Filters and sorts the food database based on query, category/filterMode, and sortBy.
 */
export function filterAndSortFoodDatabase(
  database: FoodItem[],
  options: FilterSortOptions
): FoodItem[] {
  const { query = '', category = 'all', sortBy = 'name' } = options;
  const cleanQuery = query.trim().toLowerCase();

  return database
    .filter((food) => {
      // Query filter
      if (cleanQuery) {
        const matchesName = food.name.toLowerCase().includes(cleanQuery);
        const matchesBrand = food.brand ? food.brand.toLowerCase().includes(cleanQuery) : false;
        const matchesBarcode = food.barcode ? food.barcode.includes(cleanQuery) : false;
        if (!matchesName && !matchesBrand && !matchesBarcode) {
          return false;
        }
      }

      // Category / View filters
      if (category === 'all') return true;
      if (category === 'custom') return !!food.isCustom;
      if (category === 'edited') return !!food.isEdited;
      if (category === 'favorites') return !!food.isFavorite;

      return food.category === category;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'calories_desc':
          return b.caloriesPer100g - a.caloriesPer100g;
        case 'calories_asc':
          return a.caloriesPer100g - b.caloriesPer100g;
        case 'protein':
          return b.proteinPer100g - a.proteinPer100g;
        case 'carbs':
          return b.carbsPer100g - a.carbsPer100g;
        case 'fat':
          return b.fatPer100g - a.fatPer100g;
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' });
      }
    });
}
