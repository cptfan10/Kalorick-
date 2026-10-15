export type Gender = 'male' | 'female';

export type ActivityLevel = 
  | 'sedentary'     // Sedavé zaměstnání, minimum pohybu
  | 'light'         // Lehká aktivita 1-3x týdně
  | 'moderate'      // Střední aktivita 3-5x týdně
  | 'very_active'   // Velmi aktivní 6-7x týdně
  | 'extra_active';  // Extrémní zátěž / fyzická práce + tréninky

export type FitnessGoal = 
  | 'lose_moderate' // Hubnutí mírné (~0.5 kg/týden)
  | 'lose_fast'     // Hubnutí rychlejší (~0.8 kg/týden)
  | 'maintain'      // Udržování hmotnosti
  | 'gain_moderate' // Nabírání svalů mírné (~0.25-0.3 kg/týden)
  | 'gain_fast';    // Nabírání svalů / objem (~0.5 kg/týden)

export interface UserProfile {
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  ageYears: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  customTargetsEnabled: boolean;
  customTargets?: DailyTargets;
}

export interface DailyTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterMl: number;
}

export type FoodCategory =
  | 'meat_fish'
  | 'dairy_eggs'
  | 'grains_bread'
  | 'legumes'
  | 'fruit_veg'
  | 'nuts_seeds_oils'
  | 'drinks_supplements'
  | 'custom';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: FoodCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  defaultPortionGrams: number;
  servingUnit: string; // e.g. "g", "ml", "ks", "porce"
  isCustom?: boolean;
  isEdited?: boolean;
  isFavorite?: boolean;
  imageUrl?: string;
  updatedAt?: string;
}

export type MealType =
  | 'snidane'
  | 'svacina_dopoledne'
  | 'obed'
  | 'svacina_odpoledne'
  | 'vecere'
  | 'druha_vecere';

export interface MealEntry {
  id: string;
  foodId: string;
  name: string;
  brand?: string;
  barcode?: string;
  portionGrams: number;
  portionUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealType: MealType;
  timeStr: string;
}

// --- PHYSICAL ACTIVITY & EXERCISE ---
export type ExerciseActivityType =
  | 'running'         // Běh
  | 'cycling'         // Cyklistika / spinning
  | 'swimming'        // Plavání
  | 'weightlifting'   // Posilování / silový trénink
  | 'walking'         // Chůze / turistika
  | 'hiit'            // HIIT / kruhový trénink
  | 'yoga_pilates'    // Jóga / pilates
  | 'football'        // Fotbal / míčové sporty
  | 'tennis'          // Tenis / squash / badminton
  | 'boxing'          // Bojové sporty / box
  | 'jump_rope'       // Švihadlo
  | 'rowing'          // Veslování
  | 'custom';         // Vlastní aktivita

export type ExerciseIntensity = 'low' | 'moderate' | 'high';

export interface ExerciseEntry {
  id: string;
  activityType: ExerciseActivityType;
  customName?: string;
  durationMinutes: number;
  intensity: ExerciseIntensity;
  caloriesBurned: number;
  timeStr: string;
  note?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  exercises?: ExerciseEntry[];
  waterMl: number;
  weightKg?: number;
  note?: string;
}

export interface WeightEntry {
  date: string;
  weightKg: number;
  note?: string;
}

export interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealRecommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  whyRecommended: string;
  ingredients: string[];
  preparationTimeMin: number;
  quickAddFoods?: { foodId: string; portionGrams: number }[];
}

// --- WEEKLY MEAL PLANS & DETAILED RECIPES ---
export type DietaryPreference = 
  | 'balanced'        // Vyvážená strava
  | 'high_protein'    // Vysokoproteinová (fitness)
  | 'low_carb'        // Low carb / nízkosacharidová
  | 'vegetarian'      // Vegetariánská
  | 'vegan'           // Veganská
  | 'mediterranean';  // Středomořská

export type Allergen = 
  | 'gluten'          // Lepek
  | 'lactose'         // Laktóza
  | 'nuts'            // Ořechy
  | 'eggs'            // Vejce
  | 'soy'             // Sója
  | 'seafood';        // Mořské plody & ryby

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  category: 'produce' | 'meat' | 'dairy' | 'grains' | 'pantry';
}

export interface PlannedRecipe {
  id: string;
  title: string;
  mealType: MealType;
  description: string;
  preparationTimeMin: number;
  difficulty: 'Snadné' | 'Střední' | 'Pokročilé';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  allergens: Allergen[];
  dietaryStyles: DietaryPreference[];
}

export interface DayPlan {
  dayIndex: number; // 0 = Pondělí, 6 = Neděle
  dayName: string;
  meals: PlannedRecipe[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
}

export interface WeeklyPlanPreferences {
  dailyCalories: number;
  goal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  allergens: Allergen[];
}

export interface WeeklyPlan {
  id: string;
  createdAt: string;
  preferences: WeeklyPlanPreferences;
  days: DayPlan[];
}
