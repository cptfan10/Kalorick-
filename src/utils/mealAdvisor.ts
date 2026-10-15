import { FoodItem, MealRecommendation, NutrientTotals, DailyTargets } from '../types/nutrition.ts';

export const CURATED_MEAL_IDEAS: MealRecommendation[] = [
  {
    id: 'rec_tvaroh_bowl',
    title: 'Proteinový tvarohový bowl s borůvkami a mandlemi',
    category: 'Svačina / Lehká večeře',
    description: 'Rychlé, nevařené jídlo plné pomalu stravitelného kaseinu, který skvěle zasytí a podpoří regeneraci svalů.',
    calories: 285,
    protein: 34,
    carbs: 18,
    fat: 8,
    fiber: 5,
    whyRecommended: 'Vysoký obsah bílkovin s minimem tuku a skvělým zasyscením na večer.',
    ingredients: [
      '200g odtučněný tvaroh',
      '80g lesní borůvky nebo jahody',
      '15g mandle natural',
      'Špetka skořice',
    ],
    preparationTimeMin: 3,
    quickAddFoods: [
      { foodId: 'food_tvaroh_odtucneny', portionGrams: 200 },
      { foodId: 'food_boruvky', portionGrams: 80 },
      { foodId: 'food_mandle', portionGrams: 15 },
    ],
  },
  {
    id: 'rec_kure_bataty',
    title: 'Grilovaná kuřecí prsa s pečenými batáty a brokolicí',
    category: 'Oběd / Večeře',
    description: 'Klasické vyvážené fitness jídlo bohaté na čisté bílkoviny, komplexní sacharidy a mikroživiny.',
    calories: 460,
    protein: 42,
    carbs: 45,
    fat: 9,
    fiber: 8,
    whyRecommended: 'Ideální poměr makroživin pro regeneraci a optimální sytost bez těžkého pocitu.',
    ingredients: [
      '160g kuřecí prsa',
      '180g pečené batáty s bylinkami',
      '150g brokolice na páře',
      '5ml extra panenský olivový olej',
    ],
    preparationTimeMin: 25,
    quickAddFoods: [
      { foodId: 'food_kureci_prsa', portionGrams: 160 },
      { foodId: 'food_bataty', portionGrams: 180 },
      { foodId: 'food_brokolice', portionGrams: 150 },
    ],
  },
  {
    id: 'rec_losos_quinoa',
    title: 'Pečený losos na bylinkách s quinoou a chřestem či špenátem',
    category: 'Oběd / Večeře',
    description: 'Vynikající zdroj esenciálních omega-3 mastných kyselin, antioxidantů a kompletních rostlinných bílkovin.',
    calories: 520,
    protein: 40,
    carbs: 34,
    fat: 23,
    fiber: 6,
    whyRecommended: 'Perfektní pro doplnění zdravých nenasycených tuků a špičkových bílkovin.',
    ingredients: [
      '150g filet z čerstvého lososa',
      '150g vařená quinoa',
      '60g baby špenát restovaný na česneku',
      'Citronová šťáva',
    ],
    preparationTimeMin: 20,
    quickAddFoods: [
      { foodId: 'food_losos', portionGrams: 150 },
      { foodId: 'food_quinoa_cooked', portionGrams: 150 },
      { foodId: 'food_spenat_baby', portionGrams: 60 },
    ],
  },
  {
    id: 'rec_tunak_salat',
    title: 'Středomořský tuňákový salát s vejcem a žitným chlebem',
    category: 'Večeře / Oběd do krabičky',
    description: 'Svěží, křupavý salát s vysokým obsahem bílkovin, který připravíš do 10 minut.',
    calories: 395,
    protein: 41,
    carbs: 32,
    fat: 10,
    fiber: 6,
    whyRecommended: 'Rychlá příprava, špičkový protein a nízký obsah nasycených tuků.',
    ingredients: [
      '120g tuňák ve vlastní šťávě',
      '1ks vejce natvrdo',
      '1ks rajče a 1/2 salátové okurky',
      '1 krajíc (60g) kváskový žitný chléb',
    ],
    preparationTimeMin: 10,
    quickAddFoods: [
      { foodId: 'food_tunak_stava', portionGrams: 120 },
      { foodId: 'food_vejce_m', portionGrams: 55 },
      { foodId: 'food_rajce', portionGrams: 120 },
      { foodId: 'food_chleb_zitny_kvasek', portionGrams: 60 },
    ],
  },
  {
    id: 'rec_cottage_snack',
    title: 'Cottage miska s cherry rajčaty a žitným knäckebrotem',
    category: 'Lehká svačina / Druhá večeře',
    description: 'Lehké, osvěžující jídlo s nízkou kalorickou denzitou, ideální když zbývá málo kalorií.',
    calories: 220,
    protein: 21,
    carbs: 18,
    fat: 6.5,
    fiber: 4,
    whyRecommended: 'Nízkokalorická svačina, která spolehlivě zažene večerní hlad.',
    ingredients: [
      '150g cottage sýr přírodní',
      '100g cherry rajčata',
      '2ks žitný knäckebrot',
      'Čerstvá pažitka a špetka soli',
    ],
    preparationTimeMin: 3,
    quickAddFoods: [
      { foodId: 'food_cottage', portionGrams: 150 },
      { foodId: 'food_rajce', portionGrams: 100 },
    ],
  },
  {
    id: 'rec_protein_oats',
    title: 'Vydatná ovesná proteinová kaše s banánem',
    category: 'Snídaně plná energie',
    description: 'Dokonalý start dne s pozvolným uvolňováním energie a kompletním spektrem aminokyselin.',
    calories: 430,
    protein: 32,
    carbs: 62,
    fat: 6,
    fiber: 8,
    whyRecommended: 'Doplní ranní energii a dodá tělu dostatek vlákniny pro zdravé trávení.',
    ingredients: [
      '55g jemné ovesné vločky',
      '25g syrovátkový protein (vanilka nebo čokoláda)',
      '1/2 banánu nakrájeného na plátky',
      '180ml horké vody nebo polotučného mléka',
    ],
    preparationTimeMin: 5,
    quickAddFoods: [
      { foodId: 'food_vlocky_ovesne', portionGrams: 55 },
      { foodId: 'food_whey_protein', portionGrams: 25 },
      { foodId: 'food_banan', portionGrams: 60 },
    ],
  },
  {
    id: 'rec_tofu_stirfry',
    title: 'Barevný stir-fry z tofu, brokolice a jasmínové rýže',
    category: 'Rostlinný oběd / Večeře',
    description: 'Chutné vegetariánské jídlo plné křupavé zeleniny, sójových izoflavonů a antioxidantů.',
    calories: 440,
    protein: 24,
    carbs: 58,
    fat: 12,
    fiber: 7,
    whyRecommended: 'Skvělá volba pro odlehčení trávení bez kompromisů v příjmu bílkovin.',
    ingredients: [
      '140g tofu natural opraženého do křupava',
      '160g vařená jasmínová rýže',
      '120g brokolice a červená paprika',
      'Lžička sójové omáčky a sezamu',
    ],
    preparationTimeMin: 15,
    quickAddFoods: [
      { foodId: 'food_tofu', portionGrams: 140 },
      { foodId: 'food_ryze_jasminova_cooked', portionGrams: 160 },
      { foodId: 'food_brokolice', portionGrams: 120 },
    ],
  },
];

/**
 * Ranks and filters meal recommendations matching the user's remaining deficits.
 */
export function recommendMealsForRemainingMacros(
  remaining: { caloriesRemaining: number; proteinRemaining: number; carbsRemaining: number; fatRemaining: number },
  userGoal: string
): MealRecommendation[] {
  return CURATED_MEAL_IDEAS.map(rec => {
    let score = 100;

    // Penalty if calories overshoot remaining deficit significantly
    if (remaining.caloriesRemaining > 100 && rec.calories > remaining.caloriesRemaining + 150) {
      score -= 40;
    }

    // Huge bonus if protein solves current protein deficit
    if (remaining.proteinRemaining > 20 && rec.protein >= 30) {
      score += 35;
    }

    // If remaining calories are low, prefer light meals
    if (remaining.caloriesRemaining < 350) {
      if (rec.calories <= 320) score += 30;
      else score -= 40;
    }

    // Weight loss bonus
    if ((userGoal === 'lose_moderate' || userGoal === 'lose_fast') && rec.protein >= 30 && rec.fat <= 12) {
      score += 20;
    }

    return { rec, score };
  })
  .sort((a, b) => b.score - a.score)
  .map(item => item.rec);
}
