import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateWeeklyPlan, 
  filterRecipesByPreferences, 
  generateShoppingList, 
  MASTER_RECIPES 
} from './weeklyPlanGenerator.ts';

test('filterRecipesByPreferences properly excludes specified allergens', () => {
  // Exclude lactose
  const noLactose = filterRecipesByPreferences(MASTER_RECIPES, 'balanced', ['lactose']);
  for (const recipe of noLactose) {
    assert.equal(recipe.allergens.includes('lactose'), false, `Recipe ${recipe.title} should not contain lactose`);
  }

  // Exclude gluten
  const noGluten = filterRecipesByPreferences(MASTER_RECIPES, 'balanced', ['gluten']);
  for (const recipe of noGluten) {
    assert.equal(recipe.allergens.includes('gluten'), false, `Recipe ${recipe.title} should not contain gluten`);
  }
});

test('generateWeeklyPlan generates all 7 days with calibrated daily totals', () => {
  const plan = generateWeeklyPlan({
    dailyCalories: 2200,
    goal: 'lose_moderate',
    dietaryPreference: 'balanced',
    allergens: [],
  });

  assert.equal(plan.days.length, 7);
  assert.equal(plan.days[0].dayName, 'Pondělí');
  assert.equal(plan.days[6].dayName, 'Neděle');

  // Each day should have meals and approximate the target calories
  for (const day of plan.days) {
    assert.ok(day.meals.length >= 4, 'Day should have at least 4 meals');
    assert.ok(day.totalCalories > 1700 && day.totalCalories < 2700, 'Calories should be within tolerance');
    assert.ok(day.totalProtein > 70, 'Protein should be adequate');
  }
});

test('generateShoppingList aggregates ingredient quantities by department', () => {
  const plan = generateWeeklyPlan({
    dailyCalories: 2000,
    goal: 'maintain',
    dietaryPreference: 'balanced',
    allergens: [],
  });

  const shoppingList = generateShoppingList(plan);
  assert.ok(shoppingList.produce.length > 0, 'Produce list should not be empty');
  assert.ok(shoppingList.grains.length > 0, 'Grains list should not be empty');
  
  // Total amounts should be positive numbers
  for (const item of shoppingList.produce) {
    assert.ok(item.totalAmount > 0);
    assert.ok(item.unit.length > 0);
  }
});
