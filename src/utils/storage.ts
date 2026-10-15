import { DayLog, FoodItem, MealEntry, UserProfile, WeightEntry, WeeklyPlan } from '../types/nutrition.ts';
import { DEFAULT_FOOD_DATABASE } from '../data/defaultFoodDatabase.ts';
import { repairFoodDatabase } from './foodDatabaseManager.ts';

const STORAGE_KEYS = {
  PROFILE: 'nutriplan_profile_v1',
  FOODS: 'nutriplan_foods_v1',
  LOGS: 'nutriplan_day_logs_v1',
  WEIGHT_HISTORY: 'nutriplan_weight_history_v1',
  WEEKLY_PLAN: 'nutriplan_weekly_plan_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  heightCm: 178,
  weightKg: 82,
  targetWeightKg: 75,
  ageYears: 29,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'lose_moderate',
  customTargetsEnabled: false,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading profile:', e);
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function loadFoodDatabase(): FoodItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOODS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(DEFAULT_FOOD_DATABASE));
      return DEFAULT_FOOD_DATABASE;
    }
    const foods = JSON.parse(raw);
    if (Array.isArray(foods)) {
      return foods;
    }
    return DEFAULT_FOOD_DATABASE;
  } catch (e) {
    console.error('Error loading food database:', e);
    return DEFAULT_FOOD_DATABASE;
  }
}

export type ResetDatabaseMode = 'repair' | 'restore_missing' | 'factory_reset' | 'clear_custom';

export function resetFoodDatabase(mode: ResetDatabaseMode = 'repair'): FoodItem[] {
  try {
    if (mode === 'factory_reset') {
      // 100% clean factory reset
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(DEFAULT_FOOD_DATABASE));
      return DEFAULT_FOOD_DATABASE;
    }

    if (mode === 'clear_custom') {
      // Keep only default catalog foods, remove user custom items and revert edits
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(DEFAULT_FOOD_DATABASE));
      return DEFAULT_FOOD_DATABASE;
    }

    // 'repair' & 'restore_missing': Sanitize, remove duplicates, fix corrupted values and restore defaults
    const current = loadFoodDatabase();
    const repairResult = repairFoodDatabase(current, DEFAULT_FOOD_DATABASE);
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(repairResult.repairedDatabase));
    return repairResult.repairedDatabase;
  } catch (e) {
    console.error('Error resetting food database:', e);
    return DEFAULT_FOOD_DATABASE;
  }
}

export function resetDayLog(date?: string): Record<string, DayLog> {
  try {
    const logs = loadDayLogs();
    const targetDate = date || getTodayDateString();
    logs[targetDate] = {
      date: targetDate,
      meals: [],
      exercises: [],
      waterMl: 0,
      notes: '',
    };
    saveDayLogs(logs);
    return logs;
  } catch (e) {
    console.error('Error resetting day log:', e);
    return {};
  }
}

export function saveFoodDatabase(foods: FoodItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
  } catch (e) {
    console.error('Error saving food database:', e);
  }
}

export function loadDayLogs(): Record<string, DayLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      // Seed initial demo data for today and yesterday so the charts and diary are immediately active!
      const initialLogs = seedInitialDemoLogs();
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading day logs:', e);
    return {};
  }
}

export function saveDayLogs(logs: Record<string, DayLog>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving day logs:', e);
  }
}

export function loadWeightHistory(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
    if (!raw) {
      const initial = seedInitialWeightHistory();
      localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading weight history:', e);
    return [];
  }
}

export function saveWeightHistory(history: WeightEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving weight history:', e);
  }
}

export function loadWeeklyPlan(): WeeklyPlan | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading weekly plan:', e);
    return undefined;
  }
}

export function saveWeeklyPlan(plan: WeeklyPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving weekly plan:', e);
  }
}

/**
 * Seed initial realistic weight log history (over the last 4 weeks) for instant visual charts.
 */
function seedInitialWeightHistory(): WeightEntry[] {
  const history: WeightEntry[] = [];
  const baseWeight = 85.5;
  const now = new Date();

  const dataPoints = [
    { daysAgo: 28, weight: 85.5, note: 'Začátek nového režimu' },
    { daysAgo: 21, weight: 84.8, note: 'První týden' },
    { daysAgo: 14, weight: 83.9, note: 'Více kardia a pitného režimu' },
    { daysAgo: 7, weight: 83.1, note: 'Pocit lehkosti' },
    { daysAgo: 0, weight: 82.0, note: 'Aktuální váha' },
  ];

  dataPoints.forEach(pt => {
    const d = new Date(now);
    d.setDate(d.getDate() - pt.daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    history.push({
      date: dateStr,
      weightKg: pt.weight,
      note: pt.note,
    });
  });

  return history;
}

/**
 * Seed initial realistic demo logs for today and previous 4 days so charts have rich trend lines.
 */
function seedInitialDemoLogs(): Record<string, DayLog> {
  const logs: Record<string, DayLog> = {};
  const today = getTodayDateString();

  // Today's meals
  logs[today] = {
    date: today,
    waterMl: 1750,
    weightKg: 82.0,
    note: 'Cítím se plný energie po ranní ovesné kaši.',
    exercises: [
      {
        id: 'seed_ex_1',
        activityType: 'running',
        durationMinutes: 35,
        intensity: 'moderate',
        caloriesBurned: 467,
        timeStr: '06:45',
        note: 'Ranní proběhnutí v parku',
      },
    ],
    meals: [
      {
        id: 'meal_1',
        foodId: 'food_vlocky_ovesne',
        name: 'Ovesné vločky jemné',
        portionGrams: 60,
        portionUnit: 'g',
        calories: 222,
        protein: 8.1,
        carbs: 34.8,
        fat: 4.2,
        fiber: 6.0,
        mealType: 'snidane',
        timeStr: '07:45',
      },
      {
        id: 'meal_2',
        foodId: 'food_whey_protein',
        name: 'Syrovátkový protein 80 %',
        portionGrams: 30,
        portionUnit: 'g',
        calories: 119,
        protein: 23.4,
        carbs: 1.8,
        fat: 2.0,
        fiber: 0.4,
        mealType: 'snidane',
        timeStr: '07:45',
      },
      {
        id: 'meal_3',
        foodId: 'food_boruvky',
        name: 'Lesní borůvky čerstvé',
        portionGrams: 80,
        portionUnit: 'g',
        calories: 46,
        protein: 0.6,
        carbs: 9.8,
        fat: 0.2,
        fiber: 1.9,
        mealType: 'snidane',
        timeStr: '07:45',
      },
      {
        id: 'meal_4',
        foodId: 'food_jablko',
        name: 'Jablko čerstvé se slupkou',
        portionGrams: 150,
        portionUnit: 'ks',
        calories: 78,
        protein: 0.5,
        carbs: 18.0,
        fat: 0.3,
        fiber: 3.6,
        mealType: 'svacina_dopoledne',
        timeStr: '10:30',
      },
      {
        id: 'meal_5',
        foodId: 'food_kureci_prsa',
        name: 'Kuřecí prsa (dušená/pečená)',
        portionGrams: 180,
        portionUnit: 'g',
        calories: 216,
        protein: 42.3,
        carbs: 0,
        fat: 4.0,
        fiber: 0,
        mealType: 'obed',
        timeStr: '12:45',
      },
      {
        id: 'meal_6',
        foodId: 'food_ryze_basmati_cooked',
        name: 'Rýže Basmati (vařená)',
        portionGrams: 180,
        portionUnit: 'g',
        calories: 225,
        protein: 5.6,
        carbs: 49.5,
        fat: 0.5,
        fiber: 1.1,
        mealType: 'obed',
        timeStr: '12:45',
      },
      {
        id: 'meal_7',
        foodId: 'food_brokolice',
        name: 'Brokolice (dušená na páře)',
        portionGrams: 150,
        portionUnit: 'g',
        calories: 53,
        protein: 4.2,
        carbs: 6.3,
        fat: 0.6,
        fiber: 3.9,
        mealType: 'obed',
        timeStr: '12:45',
      },
    ],
  };

  // Seed previous days for calorie charts
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayCalories = 2100 + Math.round((Math.sin(i) * 180));
    logs[dateStr] = {
      date: dateStr,
      waterMl: 2250 + (i % 2 === 0 ? 250 : -250),
      meals: [
        {
          id: `seed_m1_${i}`,
          foodId: 'food_kureci_prsa',
          name: 'Kuřecí prsa a přílohy',
          portionGrams: 300,
          portionUnit: 'porce',
          calories: Math.round(dayCalories * 0.4),
          protein: 48,
          carbs: 55,
          fat: 14,
          fiber: 8,
          mealType: 'obed',
          timeStr: '12:30',
        },
        {
          id: `seed_m2_${i}`,
          foodId: 'food_tvaroh_polotucny',
          name: 'Tvarohová večeře s ořechy',
          portionGrams: 250,
          portionUnit: 'porce',
          calories: Math.round(dayCalories * 0.35),
          protein: 40,
          carbs: 28,
          fat: 18,
          fiber: 6,
          mealType: 'vecere',
          timeStr: '19:00',
        },
        {
          id: `seed_m3_${i}`,
          foodId: 'food_vlocky_ovesne',
          name: 'Snídaně s ovocem',
          portionGrams: 200,
          portionUnit: 'porce',
          calories: Math.round(dayCalories * 0.25),
          protein: 26,
          carbs: 52,
          fat: 8,
          fiber: 9,
          mealType: 'snidane',
          timeStr: '08:00',
        },
      ],
    };
  }

  return logs;
}
