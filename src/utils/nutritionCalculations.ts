import type { ActivityLevel, DailyTargets, FitnessGoal, Gender, MealEntry, NutrientTotals, UserProfile } from '../types/nutrition.ts';

/**
 * Calculates Basal Metabolic Rate using the validated Mifflin-St Jeor equation.
 * Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateBMR(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const { gender, weightKg, heightCm, ageYears } = params;
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return 0;
  
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  return Math.round(Math.max(bmr, 800));
}

/**
 * Activity multipliers based on PAL (Physical Activity Level) standards.
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,       // Sedavé zaměstnání, téměř žádný sport
  light: 1.375,         // Lehká aktivita (chůze, 1-3 lehké tréninky týdně)
  moderate: 1.55,       // Střední aktivita (3-5 tréninků týdně, aktivní práce)
  very_active: 1.725,   // Vysoká zátěž (6-7 tréninků týdně)
  extra_active: 1.9,    // Extrémní sportovec / těžká manuální práce
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates BMI and returns numerical value and Czech classification.
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'podváha' | 'normální váha' | 'nadváha' | 'obezita 1. stupně' | 'obezita 2. stupně+';
  color: string;
} {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: 'normální váha', color: 'text-slate-400' };
  }
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  if (bmi < 18.5) {
    return { bmi, category: 'podváha', color: 'text-amber-400' };
  } else if (bmi < 25) {
    return { bmi, category: 'normální váha', color: 'text-emerald-400' };
  } else if (bmi < 30) {
    return { bmi, category: 'nadváha', color: 'text-amber-400' };
  } else if (bmi < 35) {
    return { bmi, category: 'obezita 1. stupně', color: 'text-orange-400' };
  } else {
    return { bmi, category: 'obezita 2. stupně+', color: 'text-rose-400' };
  }
}

/**
 * Computes targeted daily calories and macronutrient breakdown according to user profile.
 */
export function calculateDailyTargets(profile: UserProfile): DailyTargets {
  if (profile.customTargetsEnabled && profile.customTargets) {
    return profile.customTargets;
  }

  const bmr = calculateBMR({
    gender: profile.gender,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    ageYears: profile.ageYears,
  });

  const tdee = calculateTDEE(bmr, profile.activityLevel);

  let targetCalories = tdee;
  let proteinPerKg = 1.8; // Standard high-quality fitness baseline

  switch (profile.goal) {
    case 'lose_moderate':
      targetCalories = tdee - 450;
      proteinPerKg = 2.0; // Higher protein to preserve lean muscle during deficit
      break;
    case 'lose_fast':
      targetCalories = tdee - 750;
      proteinPerKg = 2.2;
      break;
    case 'maintain':
      targetCalories = tdee;
      proteinPerKg = 1.8;
      break;
    case 'gain_moderate':
      targetCalories = tdee + 300;
      proteinPerKg = 1.9;
      break;
    case 'gain_fast':
      targetCalories = tdee + 500;
      proteinPerKg = 2.0;
      break;
  }

  // Safe minimum calorie thresholds
  const minSafeCalories = profile.gender === 'male' ? 1500 : 1250;
  targetCalories = Math.max(targetCalories, minSafeCalories);

  // Protein calculation (4 kcal per g)
  const proteinGrams = Math.round(profile.weightKg * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Fat calculation (9 kcal per g) - approx 25-28% of target calories, min 0.8g/kg
  const fatCaloriesTarget = Math.max(targetCalories * 0.27, profile.weightKg * 0.8 * 9);
  const fatGrams = Math.round(fatCaloriesTarget / 9);
  const fatCalories = fatGrams * 9;

  // Remaining calories go to carbohydrates (4 kcal per g)
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(remainingCalories / 4);

  // Fiber recommendation: ~14g per 1000 kcal (usually 25-35g)
  const fiberGrams = Math.round(Math.max(25, (targetCalories / 1000) * 14));

  // Water recommendation: ~35ml per kg body weight + active bonus
  const activeBonus = profile.activityLevel === 'very_active' || profile.activityLevel === 'extra_active' ? 750 : 350;
  const waterMl = Math.round(profile.weightKg * 35 + activeBonus);

  return {
    calories: Math.round(targetCalories),
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    waterMl,
  };
}

/**
 * Calculates sum of nutrients from a list of meal entries.
 */
export function calculateNutrientTotals(meals: MealEntry[]): NutrientTotals {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: Math.round((acc.protein + (meal.protein || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + (meal.carbs || 0)) * 10) / 10,
      fat: Math.round((acc.fat + (meal.fat || 0)) * 10) / 10,
      fiber: Math.round((acc.fiber + (meal.fiber || 0)) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

/**
 * Analyzes remaining daily budget and delivers practical advice in Czech.
 */
export function analyzeDailyStatus(consumed: NutrientTotals, targets: DailyTargets): {
  caloriesRemaining: number;
  proteinRemaining: number;
  carbsRemaining: number;
  fatRemaining: number;
  fiberRemaining: number;
  advice: string;
  focusNutrient: 'protein' | 'fiber' | 'balanced' | 'limit_calories' | 'calories_needed';
} {
  const caloriesRemaining = (targets.calories || 0) - consumed.calories;
  const proteinRemaining = Math.round((targets.proteinGrams || 0) - consumed.protein);
  const carbsRemaining = Math.round((targets.carbsGrams || 0) - consumed.carbs);
  const fatRemaining = Math.round((targets.fatGrams || 0) - consumed.fat);
  const fiberRemaining = Math.round((targets.fiberGrams || 0) - consumed.fiber);

  let advice = '';
  let focusNutrient: 'protein' | 'fiber' | 'balanced' | 'limit_calories' | 'calories_needed' = 'balanced';

  if (caloriesRemaining < -150) {
    advice = `Dnes jsi překročil(a) kalorický cíl o ${Math.abs(caloriesRemaining)} kcal. Zaměř se na lehké jídlo jako zeleninový salát nebo čistý tvaroh s bylinkami.`;
    focusNutrient = 'limit_calories';
  } else if (caloriesRemaining > 500 && proteinRemaining > 40) {
    advice = `Máš ještě dostatek energie (${caloriesRemaining} kcal) a chybí ti ${proteinRemaining}g bílkovin. Ideální čas na kvalitní bílkovinné jídlo (kuřecí maso, ryba, vejce, skyr nebo tofu).`;
    focusNutrient = 'protein';
  } else if (proteinRemaining > 25 && caloriesRemaining > 200) {
    advice = `Bílkoviny jsou mírně pozadu (chybí ${proteinRemaining}g). Přidej k dalšímu jídlu proteinový shake, řecký jogurt, cottage nebo tuňáka.`;
    focusNutrient = 'protein';
  } else if (fiberRemaining > 15 && caloriesRemaining > 150) {
    advice = `Pozor na vlákninu, dnes ti chybí ještě ${fiberRemaining}g. Zařaď luštěniny, chia semínka, ovesné vločky nebo velkou porci zeleniny s ovocem.`;
    focusNutrient = 'fiber';
  } else if (caloriesRemaining > 300) {
    advice = `Zbývá ti příjemných ${caloriesRemaining} kcal. Dopřej si vyvážené jídlo s komplexními sacharidy a zdravými tuky.`;
    focusNutrient = 'calories_needed';
  } else {
    advice = `Skvělá práce! Dnes se velmi přesně držíš svých denních nutričních cílů.`;
    focusNutrient = 'balanced';
  }

  return {
    caloriesRemaining,
    proteinRemaining,
    carbsRemaining,
    fatRemaining,
    fiberRemaining,
    advice,
    focusNutrient,
  };
}
