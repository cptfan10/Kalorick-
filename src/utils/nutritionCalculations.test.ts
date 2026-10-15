import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateBMI, 
  calculateDailyTargets, 
  calculateNutrientTotals, 
  analyzeDailyStatus 
} from './nutritionCalculations.ts';

test('calculateBMR gives expected Mifflin-St Jeor values for male and female', () => {
  // Male: 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
  const bmrMale = calculateBMR({ gender: 'male', weightKg: 80, heightCm: 180, ageYears: 30 });
  assert.equal(bmrMale, 1780);

  // Female: 10 * 65 + 6.25 * 165 - 5 * 28 - 161 = 650 + 1031.25 - 140 - 161 = 1380.25 -> 1380
  const bmrFemale = calculateBMR({ gender: 'female', weightKg: 65, heightCm: 165, ageYears: 28 });
  assert.equal(bmrFemale, 1380);
});

test('calculateTDEE scales BMR by activity multiplier', () => {
  const bmr = 1800;
  // Sedentary (1.2) = 2160
  assert.equal(calculateTDEE(bmr, 'sedentary'), 2160);
  // Moderate (1.55) = 2790
  assert.equal(calculateTDEE(bmr, 'moderate'), 2790);
});

test('calculateBMI computes correct category and score', () => {
  const normal = calculateBMI(75, 180);
  assert.equal(normal.bmi, 23.1);
  assert.equal(normal.category, 'normální váha');

  const overweight = calculateBMI(92, 175);
  assert.equal(overweight.bmi, 30);
  assert.equal(overweight.category, 'obezita 1. stupně');
});

test('calculateDailyTargets computes deficit and macros for weight loss', () => {
  const profile = {
    heightCm: 180,
    weightKg: 85,
    targetWeightKg: 78,
    ageYears: 30,
    gender: 'male' as const,
    activityLevel: 'moderate' as const,
    goal: 'lose_moderate' as const,
    customTargetsEnabled: false,
  };
  const targets = calculateDailyTargets(profile);
  // BMR = 10*85 + 6.25*180 - 5*30 + 5 = 850 + 1125 - 150 + 5 = 1830
  // TDEE = 1830 * 1.55 = 2837
  // Target = 2837 - 450 = 2387
  assert.ok(targets.calories > 2200 && targets.calories < 2500);
  assert.ok(targets.proteinGrams >= 160); // 85kg * 2.0g = 170g
  assert.ok(targets.fatGrams > 50);
  assert.ok(targets.carbsGrams > 100);
  assert.ok(targets.waterMl >= 2500);
});

test('calculateNutrientTotals accumulates nutrients correctly', () => {
  const meals = [
    {
      id: '1',
      foodId: 'f1',
      name: 'Vejce',
      portionGrams: 100,
      portionUnit: 'g',
      calories: 140,
      protein: 12.5,
      carbs: 0.6,
      fat: 10,
      fiber: 0,
      mealType: 'snidane' as const,
      timeStr: '08:00',
    },
    {
      id: '2',
      foodId: 'f2',
      name: 'Ovesné vločky',
      portionGrams: 50,
      portionUnit: 'g',
      calories: 185,
      protein: 6.5,
      carbs: 30,
      fat: 3.5,
      fiber: 5,
      mealType: 'snidane' as const,
      timeStr: '08:05',
    },
  ];

  const totals = calculateNutrientTotals(meals);
  assert.equal(totals.calories, 325);
  assert.equal(totals.protein, 19);
  assert.equal(totals.carbs, 30.6);
  assert.equal(totals.fat, 13.5);
  assert.equal(totals.fiber, 5);
});

test('analyzeDailyStatus flags protein deficit when calories remain', () => {
  const consumed = { calories: 1200, protein: 50, carbs: 140, fat: 40, fiber: 10 };
  const targets = { calories: 2000, proteinGrams: 140, carbsGrams: 220, fatGrams: 60, fiberGrams: 28, waterMl: 3000 };
  const status = analyzeDailyStatus(consumed, targets);
  assert.equal(status.caloriesRemaining, 800);
  assert.equal(status.proteinRemaining, 90);
  assert.equal(status.focusNutrient, 'protein');
});
