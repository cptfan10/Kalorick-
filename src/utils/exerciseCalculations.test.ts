import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateExerciseCalories, 
  calculateDailyExerciseTotals, 
  calculateNetCalorieBalance,
  ACTIVITIES_DATABASE 
} from './exerciseCalculations.ts';

test('calculateExerciseCalories gives accurate MET calculations for running', () => {
  // Running moderate tempo (MET 9.8) for 60 min at 80kg = 9.8 * 80 * 1 = 784 kcal
  const burned = calculateExerciseCalories({
    activityType: 'running',
    durationMinutes: 60,
    intensity: 'moderate',
    weightKg: 80,
  });
  assert.equal(burned, 784);
});

test('calculateExerciseCalories scales correctly with intensity and duration', () => {
  // Weightlifting 45 min at 70kg
  // Low (MET 3.5): 3.5 * 70 * 0.75 = 183.75 -> 184
  const low = calculateExerciseCalories({
    activityType: 'weightlifting',
    durationMinutes: 45,
    intensity: 'low',
    weightKg: 70,
  });
  assert.equal(low, 184);

  // High (MET 6.8): 6.8 * 70 * 0.75 = 357
  const high = calculateExerciseCalories({
    activityType: 'weightlifting',
    durationMinutes: 45,
    intensity: 'high',
    weightKg: 70,
  });
  assert.equal(high, 357);
});

test('calculateDailyExerciseTotals accumulates multiple workouts', () => {
  const exercises = [
    {
      id: 'e1',
      activityType: 'running' as const,
      durationMinutes: 30,
      intensity: 'moderate' as const,
      caloriesBurned: 390,
      timeStr: '07:00',
    },
    {
      id: 'e2',
      activityType: 'weightlifting' as const,
      durationMinutes: 45,
      intensity: 'high' as const,
      caloriesBurned: 350,
      timeStr: '18:00',
    },
  ];

  const totals = calculateDailyExerciseTotals(exercises);
  assert.equal(totals.totalMinutes, 75);
  assert.equal(totals.totalCaloriesBurned, 740);
});

test('calculateNetCalorieBalance integrates food intake and exercise burn', () => {
  const result = calculateNetCalorieBalance({
    consumedCalories: 2000,
    burnedCalories: 500,
    targetCalories: 2200,
  });

  // Net = 2000 - 500 = 1500
  assert.equal(result.netCalories, 1500);
  // Remaining with exercise = 2200 - 1500 = 700
  assert.equal(result.remainingCaloriesWithExercise, 700);
  // Remaining food only = 2200 - 2000 = 200
  assert.equal(result.remainingCaloriesFoodOnly, 200);
  assert.equal(result.exerciseDeficitBonus, 500);
});
