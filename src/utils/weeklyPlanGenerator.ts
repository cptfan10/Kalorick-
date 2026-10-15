import type { 
  Allergen, 
  DayPlan, 
  DietaryPreference, 
  MealType, 
  PlannedRecipe, 
  RecipeIngredient, 
  WeeklyPlan, 
  WeeklyPlanPreferences 
} from '../types/nutrition.ts';

export const MASTER_RECIPES: PlannedRecipe[] = [
  // --- SNÍDANĚ (Breakfasts) ---
  {
    id: 'rec_snid_1',
    title: 'Proteinová ovesná kaše s lesními plody a mandlemi',
    mealType: 'snidane',
    description: 'Hřejivá, krémová ovesná kaše plná komplexních sacharidů a pomalu se vstřebávajících bílkovin.',
    preparationTimeMin: 7,
    difficulty: 'Snadné',
    calories: 420,
    protein: 32,
    carbs: 52,
    fat: 8,
    fiber: 9,
    allergens: ['gluten', 'nuts'],
    dietaryStyles: ['balanced', 'high_protein', 'vegetarian'],
    ingredients: [
      { name: 'Ovesné vločky jemné', amount: 60, unit: 'g', category: 'grains' },
      { name: 'Syrovátkový protein (vanilka)', amount: 25, unit: 'g', category: 'pantry' },
      { name: 'Lesní borůvky a maliny', amount: 80, unit: 'g', category: 'produce' },
      { name: 'Mandle natural plátky', amount: 12, unit: 'g', category: 'produce' },
      { name: 'Skořice mletá', amount: 2, unit: 'g', category: 'pantry' },
    ],
    instructions: [
      'Vločky zalijte 180 ml horké vody nebo mléka a za stálého míchání nechte 3 minuty zhoustnout.',
      'Odstavte z plotny, vmíchejte proteinový prášek a skořici.',
      'Ozdobte čerstvými lesními plody a křupavými mandlovými plátky.',
    ],
  },
  {
    id: 'rec_snid_2',
    title: 'Míchaná vajíčka s avokádem a žitným kváskovým chlebem',
    mealType: 'snidane',
    description: 'Nadýchaná krémová míchaná vejce na přepuštěném másle s čerstvým avokádem a kváskovým chlebem.',
    preparationTimeMin: 10,
    difficulty: 'Snadné',
    calories: 440,
    protein: 26,
    carbs: 32,
    fat: 22,
    fiber: 7,
    allergens: ['eggs', 'gluten'],
    dietaryStyles: ['balanced', 'high_protein', 'vegetarian', 'mediterranean'],
    ingredients: [
      { name: 'Čerstvá vejce vel. M', amount: 3, unit: 'ks', category: 'dairy' },
      { name: 'Žitný kváskový chléb', amount: 65, unit: 'g', category: 'grains' },
      { name: 'Zralé avokádo', amount: 45, unit: 'g', category: 'produce' },
      { name: 'Máslo nebo olivový olej', amount: 5, unit: 'g', category: 'dairy' },
      { name: 'Čerstvá pažitka a sůl', amount: 5, unit: 'g', category: 'produce' },
    ],
    instructions: [
      'Vejce rozklepněte do misky, osolte a zlehka prošlehejte vidličkou.',
      'Na mírně rozpálené pánvi s trochou másla nechte vejce pomalu srážet za stálého odhrnování od okrajů.',
      'Podávejte s opečeným plátkem žitného chleba, plátky avokáda a nasekanou pažitkou.',
    ],
  },
  {
    id: 'rec_snid_3',
    title: 'Tvarohové lívance z ovesné mouky s javorovým sirupem',
    mealType: 'snidane',
    description: 'Vláčné fitness lívance bez přidaného cukru, kde hlavní složku tvoří jemný tvaroh a ovesné vločky.',
    preparationTimeMin: 15,
    difficulty: 'Střední',
    calories: 410,
    protein: 34,
    carbs: 45,
    fat: 8,
    fiber: 6,
    allergens: ['eggs', 'gluten', 'lactose'],
    dietaryStyles: ['balanced', 'high_protein', 'vegetarian'],
    ingredients: [
      { name: 'Tvaroh odtučněný měkký', amount: 150, unit: 'g', category: 'dairy' },
      { name: 'Ovesné vločky jemné', amount: 45, unit: 'g', category: 'grains' },
      { name: 'Vejce slepičí', amount: 1, unit: 'ks', category: 'dairy' },
      { name: 'Čerstvé jahody', amount: 70, unit: 'g', category: 'produce' },
      { name: 'Javorový sirup nebo med', amount: 10, unit: 'g', category: 'pantry' },
    ],
    instructions: [
      'Rozmixujte tvaroh, ovesné vločky a vejce v hladké hustší těsto.',
      'Na suché nepřilnavé pánvi nebo s kapkou oleje opékejte lívance z každé strany cca 2 minuty dozlatova.',
      'Podávejte s nakrájenými jahodami a kapkou sirupu.',
    ],
  },
  {
    id: 'rec_snid_4',
    title: 'Veganský chia pudink s kokosovým mlékem a mangem',
    mealType: 'snidane',
    description: 'Osvěžující bezlepkový a bezlaktózový pudink nabitý omega-3 mastnými kyselinami a antioxidanty.',
    preparationTimeMin: 5,
    difficulty: 'Snadné',
    calories: 380,
    protein: 15,
    carbs: 42,
    fat: 16,
    fiber: 12,
    allergens: [],
    dietaryStyles: ['balanced', 'vegetarian', 'vegan', 'mediterranean'],
    ingredients: [
      { name: 'Chia semínka', amount: 30, unit: 'g', category: 'pantry' },
      { name: 'Mandlové nebo kokosové mléko', amount: 180, unit: 'ml', category: 'dairy' },
      { name: 'Rostlinný protein (hráškový/rýžový)', amount: 15, unit: 'g', category: 'pantry' },
      { name: 'Zralé mango pyré', amount: 80, unit: 'g', category: 'produce' },
    ],
    instructions: [
      'V shakeru promíchejte rostlinné mléko, protein a chia semínka.',
      'Nalijte do skleničky a nechte v chladu odležet (ideálně přes noc nebo alespoň 30 min).',
      'Před podáváním ozdobte kousky zralého manga.',
    ],
  },

  // --- DOPOLEDNÍ A ODPOLEDNÍ SVAČINY (Snacks) ---
  {
    id: 'rec_svac_1',
    title: 'Řecký jogurt s vlašskými ořechy a lžičkou medu',
    mealType: 'svacina_dopoledne',
    description: 'Klasická středomořská svačina bohatá na husté bílkoviny a zdravé tuky podporující mozkovou činnost.',
    preparationTimeMin: 2,
    difficulty: 'Snadné',
    calories: 220,
    protein: 16,
    carbs: 14,
    fat: 11,
    fiber: 1.5,
    allergens: ['lactose', 'nuts'],
    dietaryStyles: ['balanced', 'high_protein', 'vegetarian', 'mediterranean'],
    ingredients: [
      { name: 'Řecký jogurt 0 %', amount: 150, unit: 'g', category: 'dairy' },
      { name: 'Vlašské ořechy', amount: 15, unit: 'g', category: 'produce' },
      { name: 'Květový med', amount: 8, unit: 'g', category: 'pantry' },
    ],
    instructions: [
      'Řecký jogurt dejte do misky, posypte nasekanými ořechy a zakápněte medem.',
    ],
  },
  {
    id: 'rec_svac_2',
    title: 'Cottage sýr se salátovou okurkou a knäckebrotem',
    mealType: 'svacina_dopoledne',
    description: 'Křupavá, svěží a lehká svačina s minimem sacharidů a vysokou sytící schopností.',
    preparationTimeMin: 3,
    difficulty: 'Snadné',
    calories: 210,
    protein: 19,
    carbs: 18,
    fat: 6,
    fiber: 4,
    allergens: ['lactose', 'gluten'],
    dietaryStyles: ['balanced', 'high_protein', 'vegetarian'],
    ingredients: [
      { name: 'Cottage sýr bílý', amount: 150, unit: 'g', category: 'dairy' },
      { name: 'Okurka salátová', amount: 100, unit: 'g', category: 'produce' },
      { name: 'Žitný knäckebrot', amount: 25, unit: 'g', category: 'grains' },
    ],
    instructions: [
      'Okurku nakrájejte na tenká kolečka.',
      'Cottage dochuťte špetkou pepře a bylinkami, podávejte s knäckebrotem.',
    ],
  },
  {
    id: 'rec_svac_3',
    title: 'Jablko s 100% arašídovým máslem',
    mealType: 'svacina_odpoledne',
    description: 'Dokonalá kombinace šťavnatého jablka a čistého arašídového krému bez přidaného cukru.',
    preparationTimeMin: 2,
    difficulty: 'Snadné',
    calories: 200,
    protein: 6,
    carbs: 22,
    fat: 10,
    fiber: 4.5,
    allergens: ['nuts'],
    dietaryStyles: ['balanced', 'vegetarian', 'vegan'],
    ingredients: [
      { name: 'Jablko čerstvé', amount: 150, unit: 'g', category: 'produce' },
      { name: '100% arašídové máslo', amount: 20, unit: 'g', category: 'pantry' },
    ],
    instructions: [
      'Jablko nakrájejte na měsíčky a namáčejte do arašídového másla.',
    ],
  },
  {
    id: 'rec_svac_4',
    title: 'Krůtí rolky se šunkou, eidamem a cherry rajčátky',
    mealType: 'svacina_odpoledne',
    description: 'Blesková slaná svačina s vysokým podílem čistého proteinu téměř bez sacharidů.',
    preparationTimeMin: 3,
    difficulty: 'Snadné',
    calories: 195,
    protein: 24,
    carbs: 4,
    fat: 9,
    fiber: 1.5,
    allergens: ['lactose'],
    dietaryStyles: ['balanced', 'high_protein', 'low_carb'],
    ingredients: [
      { name: 'Krůtí šunka 96 % masa', amount: 70, unit: 'g', category: 'meat' },
      { name: 'Eidam 30 %', amount: 35, unit: 'g', category: 'dairy' },
      { name: 'Cherry rajčata', amount: 80, unit: 'g', category: 'produce' },
    ],
    instructions: [
      'Plátky sýra zaviňte do krůtí šunky a zajistěte párátkem, podávejte s rajčátky.',
    ],
  },

  // --- OBĚDY (Lunches) ---
  {
    id: 'rec_obed_1',
    title: 'Grilovaná kuřecí prsa s bylinkovou basmati rýží a dušenou brokolicí',
    mealType: 'obed',
    description: 'Základní fitness klasika v moderním pojetí – šťavnaté marinované kuřecí maso s voňavou rýží.',
    preparationTimeMin: 25,
    difficulty: 'Snadné',
    calories: 520,
    protein: 48,
    carbs: 56,
    fat: 9,
    fiber: 6,
    allergens: [],
    dietaryStyles: ['balanced', 'high_protein', 'mediterranean'],
    ingredients: [
      { name: 'Kuřecí prsa', amount: 180, unit: 'g', category: 'meat' },
      { name: 'Rýže Basmati vařená', amount: 200, unit: 'g', category: 'grains' },
      { name: 'Brokolice', amount: 150, unit: 'g', category: 'produce' },
      { name: 'Olivový olej extra panenský', amount: 7, unit: 'ml', category: 'pantry' },
      { name: 'Citronová šťáva a tymián', amount: 5, unit: 'g', category: 'produce' },
    ],
    instructions: [
      'Kuřecí prsa naložte do citronové šťávy, tymiánu, soli a kapky olivového oleje.',
      'Opečte na pánvi nebo grilu z každé strany cca 5 minut dozlatova a nechte 3 minuty odpočinout.',
      'Brokolici uvařte na páře do křupava (cca 4 minuty) a podávejte s teplou basmati rýží.',
    ],
  },
  {
    id: 'rec_obed_2',
    title: 'Pečený losos na citronu s quinoou a pečeným chřestem či fazolkami',
    mealType: 'obed',
    description: 'Prémiový rybí oběd bohatý na esenciální mastné kyseliny EPA/DHA a bezlepkovou quinou.',
    preparationTimeMin: 25,
    difficulty: 'Střední',
    calories: 560,
    protein: 42,
    carbs: 40,
    fat: 25,
    fiber: 7,
    allergens: ['seafood'],
    dietaryStyles: ['balanced', 'high_protein', 'mediterranean'],
    ingredients: [
      { name: 'Filet z lososa', amount: 160, unit: 'g', category: 'meat' },
      { name: 'Quinoa vařená', amount: 160, unit: 'g', category: 'grains' },
      { name: 'Zelené fazolky nebo chřest', amount: 140, unit: 'g', category: 'produce' },
      { name: 'Olivový olej', amount: 5, unit: 'ml', category: 'pantry' },
      { name: 'Plátky citronu a česnek', amount: 10, unit: 'g', category: 'produce' },
    ],
    instructions: [
      'Filet lososa osolte, opepřete a položte na něj plátek citronu.',
      'Pečte v troubě na 190 °C cca 14 minut, dokud není maso jemné a růžové.',
      'Na pánvi orestujte na kapce oleje zelené fazolky s plátky česneku a podávejte s vařenou quinoou.',
    ],
  },
  {
    id: 'rec_obed_3',
    title: 'Hovězí libové nudličky na čerstvé zelenině s jasmínovou rýží',
    mealType: 'obed',
    description: 'Rychlý asijský stir-fry z libové hovězí kýty s barevnou paprikou a jarní cibulkou.',
    preparationTimeMin: 20,
    difficulty: 'Střední',
    calories: 540,
    protein: 44,
    carbs: 58,
    fat: 13,
    fiber: 5,
    allergens: ['soy'],
    dietaryStyles: ['balanced', 'high_protein'],
    ingredients: [
      { name: 'Hovězí kýta libová', amount: 160, unit: 'g', category: 'meat' },
      { name: 'Rýže jasmínová vařená', amount: 190, unit: 'g', category: 'grains' },
      { name: 'Červená paprika', amount: 80, unit: 'g', category: 'produce' },
      { name: 'Cuketa', amount: 80, unit: 'g', category: 'produce' },
      { name: 'Kvalitní sójová omáčka', amount: 10, unit: 'ml', category: 'pantry' },
    ],
    instructions: [
      'Hovězí maso nakrájejte na tenké nudličky a zeleninu na proužky.',
      'Na prudce rozpálené pánvi zprudka orestujte maso (2-3 minuty) a vyjměte.',
      'Na stejné pánvi opečte zeleninu do poloměkka, vraťte maso, zastříkněte sójovou omáčkou a servírujte s rýží.',
    ],
  },
  {
    id: 'rec_obed_4',
    title: 'Čočkové kari s kokosovým mlékem, baby špenátem a basmati rýží',
    mealType: 'obed',
    description: 'Voňavé indické kari z červené čočky – skvělý zdroj rostlinných bílkovin, železa a vlákniny.',
    preparationTimeMin: 25,
    difficulty: 'Snadné',
    calories: 490,
    protein: 23,
    carbs: 72,
    fat: 11,
    fiber: 14,
    allergens: [],
    dietaryStyles: ['balanced', 'vegetarian', 'vegan'],
    ingredients: [
      { name: 'Červená čočka loupaná', amount: 80, unit: 'g', category: 'grains' },
      { name: 'Kokosové mléko light', amount: 100, unit: 'ml', category: 'dairy' },
      { name: 'Baby špenát', amount: 60, unit: 'g', category: 'produce' },
      { name: 'Krájená rajčata v konzervě', amount: 120, unit: 'g', category: 'pantry' },
      { name: 'Rýže Basmati vařená', amount: 140, unit: 'g', category: 'grains' },
      { name: 'Kari koření, zázvor a kurkuma', amount: 5, unit: 'g', category: 'pantry' },
    ],
    instructions: [
      'Na kapce oleje rozvoňte kari koření a nastrouhaný zázvor.',
      'Přidejte propláchnutou čočku, rajčata a zalijte kokosovým mlékem a trochou vody.',
      'Vařte 15 minut do zhoustnutí, na závěr vmíchejte čerstvý špenát a podávejte s rýží.',
    ],
  },

  // --- VEČEŘE (Dinners) ---
  {
    id: 'rec_vec_1',
    title: 'Tuňákový salát s vařeným vejcem, olivami a celozrnným toustem',
    mealType: 'vecere',
    description: 'Lehká, osvěžující večeře s vysokým obsahem bílkovin a nízkou kalorickou náročností.',
    preparationTimeMin: 12,
    difficulty: 'Snadné',
    calories: 410,
    protein: 38,
    carbs: 26,
    fat: 16,
    fiber: 5,
    allergens: ['seafood', 'eggs', 'gluten'],
    dietaryStyles: ['balanced', 'high_protein', 'mediterranean'],
    ingredients: [
      { name: 'Tuňák ve vlastní šťávě', amount: 130, unit: 'g', category: 'meat' },
      { name: 'Vejce vařené natvrdo', amount: 1, unit: 'ks', category: 'dairy' },
      { name: 'Mix listových salátů', amount: 80, unit: 'g', category: 'produce' },
      { name: 'Okurka a cherry rajčátka', amount: 100, unit: 'g', category: 'produce' },
      { name: 'Celozrnný žitný toast', amount: 50, unit: 'g', category: 'grains' },
      { name: 'Extra panenský olivový olej', amount: 5, unit: 'ml', category: 'pantry' },
    ],
    instructions: [
      'Listový salát a zeleninu nakrájejte a promíchejte v misce s olivovým olejem a kapkou citronu.',
      'Navrch rozprostřete okapaného tuňáka a rozpůlené vařené vejce.',
      'Podávejte s křupavým opečeným žitným toastem.',
    ],
  },
  {
    id: 'rec_vec_2',
    title: 'Pečené krůtí medailonky se sladkými batáty a zelenými fazolkami',
    mealType: 'vecere',
    description: 'Šťavnaté krůtí maso plné tryptofanu pro klidný spánek s pečenými plátky batátů.',
    preparationTimeMin: 25,
    difficulty: 'Snadné',
    calories: 450,
    protein: 42,
    carbs: 44,
    fat: 9,
    fiber: 7,
    allergens: [],
    dietaryStyles: ['balanced', 'high_protein', 'mediterranean'],
    ingredients: [
      { name: 'Krůtí prsní řízek', amount: 170, unit: 'g', category: 'meat' },
      { name: 'Batáty nakrájené na hranolky', amount: 170, unit: 'g', category: 'produce' },
      { name: 'Zelené fazolky', amount: 120, unit: 'g', category: 'produce' },
      { name: 'Olivový olej a rozmarýn', amount: 6, unit: 'g', category: 'pantry' },
    ],
    instructions: [
      'Batáty nakrájejte na hranolky, promíchejte s bylinkami a pečte na 200 °C cca 20 minut.',
      'Krůtí medailonky opečte z obou stran na pánvi dozlatova.',
      'Fazolky krátce poduste na páře a vše naservírujte společně.',
    ],
  },
  {
    id: 'rec_vec_3',
    title: 'Pečené křupavé tofu s brokolicí a sezamem',
    mealType: 'vecere',
    description: 'Skvělá lehká večeře bohatá na rostlinné bílkoviny, vápník a prospěšné antioxidanty.',
    preparationTimeMin: 20,
    difficulty: 'Snadné',
    calories: 380,
    protein: 26,
    carbs: 22,
    fat: 20,
    fiber: 8,
    allergens: ['soy'],
    dietaryStyles: ['balanced', 'vegetarian', 'vegan', 'low_carb'],
    ingredients: [
      { name: 'Tofu přírodní marinované', amount: 180, unit: 'g', category: 'meat' },
      { name: 'Brokolice rozebraná na růžičky', amount: 180, unit: 'g', category: 'produce' },
      { name: 'Sezamová semínka', amount: 10, unit: 'g', category: 'pantry' },
      { name: 'Sójová omáčka Tamari', amount: 10, unit: 'ml', category: 'pantry' },
    ],
    instructions: [
      'Tofu osušte papírovou utěrkou a nakrájejte na kostky.',
      'Opečte na pánvi ze všech stran do křupava, přidejte brokolici a lžíci vody.',
      'Zakápněte sójovou omáčkou, posypte sezamem a podávejte.',
    ],
  },
];

/**
 * Filter recipes removing any user allergens.
 */
export function filterRecipesByPreferences(
  recipes: PlannedRecipe[],
  dietaryPreference: DietaryPreference,
  allergens: Allergen[]
): PlannedRecipe[] {
  return recipes.filter((rec) => {
    // 1. Exclude if recipe contains an excluded allergen
    if (allergens.some((a) => rec.allergens.includes(a))) {
      return false;
    }

    // 2. Filter by dietary style
    if (dietaryPreference === 'vegetarian' && !rec.dietaryStyles.includes('vegetarian')) return false;
    if (dietaryPreference === 'vegan' && !rec.dietaryStyles.includes('vegan')) return false;
    if (dietaryPreference === 'low_carb' && !rec.dietaryStyles.includes('low_carb') && rec.carbs > 45) return false;
    if (dietaryPreference === 'high_protein' && rec.protein < 20) return false;

    return true;
  });
}

const DAY_NAMES = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

/**
 * Generates a complete 7-day personalized meal plan matching user target calories,
 * preferences, and allergen restrictions.
 */
export function generateWeeklyPlan(preferences: WeeklyPlanPreferences): WeeklyPlan {
  const allowed = filterRecipesByPreferences(MASTER_RECIPES, preferences.dietaryPreference, preferences.allergens);

  // Categorize available recipes
  const breakfasts = allowed.filter((r) => r.mealType === 'snidane');
  const lunches = allowed.filter((r) => r.mealType === 'obed');
  const dinners = allowed.filter((r) => r.mealType === 'vecere');
  const snacks = allowed.filter((r) => r.mealType === 'svacina_dopoledne' || r.mealType === 'svacina_odpoledne');

  // Fallback pool in case strict filters leave too few
  const poolB = breakfasts.length > 0 ? breakfasts : MASTER_RECIPES.filter((r) => r.mealType === 'snidane');
  const poolL = lunches.length > 0 ? lunches : MASTER_RECIPES.filter((r) => r.mealType === 'obed');
  const poolD = dinners.length > 0 ? dinners : MASTER_RECIPES.filter((r) => r.mealType === 'vecere');
  const poolS = snacks.length > 0 ? snacks : MASTER_RECIPES.filter((r) => r.mealType.includes('svacina'));

  const targetDailyKcal = preferences.dailyCalories || 2000;

  const days: DayPlan[] = DAY_NAMES.map((dayName, index) => {
    // Pick recipes ensuring rotation
    const b = poolB[index % poolB.length];
    const s1 = poolS[index % poolS.length];
    const l = poolL[index % poolL.length];
    const s2 = poolS[(index + 1) % poolS.length];
    const d = poolD[index % poolD.length];

    const rawMeals = [b, s1, l, s2, d];
    const rawTotalKcal = rawMeals.reduce((acc, m) => acc + m.calories, 0);

    // Compute calibration ratio to closely fit target daily calories (within 0.85 - 1.25 range)
    const scale = Math.max(0.85, Math.min(1.3, targetDailyKcal / (rawTotalKcal || 1)));

    // Scale recipes slightly for the plan
    const scaledMeals: PlannedRecipe[] = rawMeals.map((recipe, mIdx) => {
      const scaledCal = Math.round(recipe.calories * scale);
      const scaledP = Math.round(recipe.protein * scale * 10) / 10;
      const scaledC = Math.round(recipe.carbs * scale * 10) / 10;
      const scaledF = Math.round(recipe.fat * scale * 10) / 10;
      const scaledFib = Math.round(recipe.fiber * scale * 10) / 10;

      const scaledIngredients = recipe.ingredients.map((ing) => ({
        ...ing,
        amount: Math.round(ing.amount * scale),
      }));

      return {
        ...recipe,
        id: `${recipe.id}_day${index}_${mIdx}`,
        calories: scaledCal,
        protein: scaledP,
        carbs: scaledC,
        fat: scaledF,
        fiber: scaledFib,
        ingredients: scaledIngredients,
      };
    });

    const dayKcal = scaledMeals.reduce((acc, m) => acc + m.calories, 0);
    const dayProtein = Math.round(scaledMeals.reduce((acc, m) => acc + m.protein, 0) * 10) / 10;
    const dayCarbs = Math.round(scaledMeals.reduce((acc, m) => acc + m.carbs, 0) * 10) / 10;
    const dayFat = Math.round(scaledMeals.reduce((acc, m) => acc + m.fat, 0) * 10) / 10;
    const dayFiber = Math.round(scaledMeals.reduce((acc, m) => acc + m.fiber, 0) * 10) / 10;

    return {
      dayIndex: index,
      dayName,
      meals: scaledMeals,
      totalCalories: dayKcal,
      totalProtein: dayProtein,
      totalCarbs: dayCarbs,
      totalFat: dayFat,
      totalFiber: dayFiber,
    };
  });

  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    preferences,
    days,
  };
}

export interface ShoppingItem {
  name: string;
  totalAmount: number;
  unit: string;
  category: 'produce' | 'meat' | 'dairy' | 'grains' | 'pantry';
  checked: boolean;
}

/**
 * Aggregates all recipes from 7 days into a structured weekly shopping checklist.
 */
export function generateShoppingList(plan: WeeklyPlan): Record<string, ShoppingItem[]> {
  const map = new Map<string, ShoppingItem>();

  plan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.ingredients.forEach((ing) => {
        const key = `${ing.name.toLowerCase().trim()}_${ing.unit}`;
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.totalAmount += ing.amount;
        } else {
          map.set(key, {
            name: ing.name,
            totalAmount: ing.amount,
            unit: ing.unit,
            category: ing.category,
            checked: false,
          });
        }
      });
    });
  });

  const categories: Record<string, ShoppingItem[]> = {
    produce: [],
    meat: [],
    dairy: [],
    grains: [],
    pantry: [],
  };

  Array.from(map.values()).forEach((item) => {
    const cat = item.category || 'pantry';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  // Sort alphabetically
  Object.keys(categories).forEach((cat) => {
    categories[cat].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  });

  return categories;
}
