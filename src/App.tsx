import React, { useState, useEffect, useMemo } from 'react';
import type { 
  DailyTargets, 
  DayLog, 
  ExerciseEntry, 
  FoodItem, 
  MealEntry, 
  MealRecommendation, 
  MealType, 
  NutrientTotals, 
  PlannedRecipe, 
  UserProfile, 
  WeightEntry, 
  WeeklyPlan,
  DayPlan
} from './types/nutrition.ts';
import { 
  getTodayDateString, 
  loadDayLogs, 
  loadFoodDatabase, 
  loadUserProfile, 
  loadWeightHistory, 
  loadWeeklyPlan,
  saveDayLogs, 
  saveFoodDatabase, 
  saveUserProfile, 
  saveWeightHistory,
  saveWeeklyPlan,
  resetFoodDatabase,
  resetDayLog,
  ResetDatabaseMode,
  DEFAULT_PROFILE
} from './utils/storage.ts';
import { DEFAULT_FOOD_DATABASE } from './data/defaultFoodDatabase.ts';
import { 
  calculateDailyTargets, 
  calculateNutrientTotals 
} from './utils/nutritionCalculations.ts';
import { generateWeeklyPlan } from './utils/weeklyPlanGenerator.ts';
import { Header, ActiveTabType } from './components/Header.tsx';
import { DailyDiaryView } from './components/DailyDiaryView.tsx';
import { AddMealModal } from './components/AddMealModal.tsx';
import { CustomFoodModal } from './components/CustomFoodModal.tsx';
import { FoodDatabaseView } from './components/FoodDatabaseView.tsx';
import { MealAdvisorView } from './components/MealAdvisorView.tsx';
import { ProgressChartsView } from './components/ProgressChartsView.tsx';
import { ProfileAnalysisView } from './components/ProfileAnalysisView.tsx';
import { ExerciseTracker } from './components/ExerciseTracker.tsx';
import { BarcodeScannerModal } from './components/BarcodeScannerModal.tsx';
import { WeeklyPlanView } from './components/WeeklyPlanView.tsx';

export default function App() {
  const today = useMemo(() => getTodayDateString(), []);
  
  // App Core State
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>(loadFoodDatabase);
  const [dayLogs, setDayLogs] = useState<Record<string, DayLog>>(loadDayLogs);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(loadWeightHistory);
  
  // Weekly Plan State
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    const saved = loadWeeklyPlan();
    if (saved) return saved;
    const targets = calculateDailyTargets(profile);
    return generateWeeklyPlan({
      dailyCalories: targets.calories,
      goal: profile.goal,
      dietaryPreference: 'balanced',
      allergens: [],
    });
  });

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('diary');
  
  // Modals state
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('obed');
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<FoodItem | null>(null);
  const [customFoodBarcodePrefill, setCustomFoodBarcodePrefill] = useState<string | undefined>(undefined);

  // Barcode Scanner Modal State
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeTargetMeal, setBarcodeTargetMeal] = useState<MealType>('obed');

  // Targets calculated dynamically based on profile
  const targets: DailyTargets = useMemo(() => {
    return calculateDailyTargets(profile);
  }, [profile]);

  // Current day log
  const currentDayLog: DayLog = useMemo(() => {
    return dayLogs[selectedDate] || {
      date: selectedDate,
      meals: [],
      exercises: [],
      waterMl: 0,
      weightKg: undefined,
      note: '',
    };
  }, [dayLogs, selectedDate]);

  // Totals for current selected day
  const currentTotals: NutrientTotals = useMemo(() => {
    return calculateNutrientTotals(currentDayLog.meals);
  }, [currentDayLog.meals]);

  // Handlers: Profile & Plan
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const handleSaveWeeklyPlan = (plan: WeeklyPlan) => {
    setWeeklyPlan(plan);
    saveWeeklyPlan(plan);
  };

  // Handlers: Diary Meals
  const handleOpenAddMeal = (mealType: MealType) => {
    setActiveMealType(mealType);
    setIsAddMealModalOpen(true);
  };

  const handleOpenBarcodeScanner = (mealType: MealType = 'obed') => {
    setBarcodeTargetMeal(mealType);
    setIsBarcodeModalOpen(true);
  };

  const handleAddMealEntry = (params: {
    foodItem: FoodItem;
    portionGrams: number;
    portionUnit: string;
    mealType: MealType;
  }) => {
    const { foodItem, portionGrams, portionUnit, mealType } = params;
    const ratio = portionGrams / 100;
    
    const newEntry: MealEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      foodId: foodItem.id,
      name: foodItem.name,
      brand: foodItem.brand,
      barcode: foodItem.barcode,
      portionGrams,
      portionUnit,
      calories: Math.round(foodItem.caloriesPer100g * ratio),
      protein: Math.round(foodItem.proteinPer100g * ratio * 10) / 10,
      carbs: Math.round(foodItem.carbsPer100g * ratio * 10) / 10,
      fat: Math.round(foodItem.fatPer100g * ratio * 10) / 10,
      fiber: Math.round(foodItem.fiberPer100g * ratio * 10) / 10,
      mealType,
      timeStr: new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedLog: DayLog = {
      ...currentDayLog,
      meals: [...currentDayLog.meals, newEntry],
    };

    const updatedDayLogs = {
      ...dayLogs,
      [selectedDate]: updatedLog,
    };

    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  const handleDeleteMealEntry = (mealId: string) => {
    const updatedLog: DayLog = {
      ...currentDayLog,
      meals: currentDayLog.meals.filter((m) => m.id !== mealId),
    };

    const updatedDayLogs = {
      ...dayLogs,
      [selectedDate]: updatedLog,
    };

    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Handlers: Physical Activities & Workouts
  const handleAddExercise = (entry: ExerciseEntry) => {
    const updatedLog: DayLog = {
      ...currentDayLog,
      exercises: [...(currentDayLog.exercises || []), entry],
    };

    const updatedDayLogs = {
      ...dayLogs,
      [selectedDate]: updatedLog,
    };

    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    const updatedLog: DayLog = {
      ...currentDayLog,
      exercises: (currentDayLog.exercises || []).filter((e) => e.id !== exerciseId),
    };

    const updatedDayLogs = {
      ...dayLogs,
      [selectedDate]: updatedLog,
    };

    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Handlers: Water, Weight & Notes
  const handleUpdateWater = (amountChangeMl: number) => {
    const newWater = Math.max(0, (currentDayLog.waterMl || 0) + amountChangeMl);
    const updatedLog: DayLog = {
      ...currentDayLog,
      waterMl: newWater,
    };

    const updatedDayLogs = {
      ...dayLogs,
      [selectedDate]: updatedLog,
    };

    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  const handleUpdateDailyWeight = (weightKg: number | undefined) => {
    const updatedLog: DayLog = {
      ...currentDayLog,
      weightKg,
    };

    const updatedDayLogs = {
      ...dayLogs,
      [selectedDate]: updatedLog,
    };

    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);

    if (weightKg !== undefined && weightKg > 0) {
      const existingIdx = weightHistory.findIndex((w) => w.date === selectedDate);
      let updatedHistory = [...weightHistory];
      if (existingIdx >= 0) {
        updatedHistory[existingIdx] = { ...updatedHistory[existingIdx], weightKg };
      } else {
        updatedHistory.push({ date: selectedDate, weightKg });
      }
      setWeightHistory(updatedHistory);
      saveWeightHistory(updatedHistory);

      if (selectedDate === today) {
        const updatedProfile = { ...profile, weightKg };
        setProfile(updatedProfile);
        saveUserProfile(updatedProfile);
      }
    }
  };

  const handleUpdateDailyNote = (note: string) => {
    const updatedLog: DayLog = {
      ...currentDayLog,
      note,
    };

    const updatedDayLogs = {
      ...dayLogs,
      [selectedDate]: updatedLog,
    };

    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Handlers: Food Database Management (Create, Edit, Delete, Restore, Favorites)
  const handleOpenCreateFoodModal = () => {
    setFoodToEdit(null);
    setCustomFoodBarcodePrefill(undefined);
    setIsCustomFoodModalOpen(true);
  };

  const handleOpenEditFoodModal = (food: FoodItem) => {
    setFoodToEdit(food);
    setCustomFoodBarcodePrefill(food.barcode);
    setIsCustomFoodModalOpen(true);
  };

  const handleSaveFood = (food: FoodItem) => {
    const existingIndex = foodDatabase.findIndex((f) => f.id === food.id);
    let updatedDatabase: FoodItem[];
    if (existingIndex >= 0) {
      updatedDatabase = [...foodDatabase];
      updatedDatabase[existingIndex] = food;
    } else {
      updatedDatabase = [food, ...foodDatabase];
    }
    setFoodDatabase(updatedDatabase);
    saveFoodDatabase(updatedDatabase);
  };

  const handleDeleteFood = (foodId: string) => {
    const updatedDatabase = foodDatabase.filter((food) => food.id !== foodId);
    setFoodDatabase(updatedDatabase);
    saveFoodDatabase(updatedDatabase);
  };

  const handleRestoreSingleDefaultFood = (foodId: string) => {
    const defaultItem = DEFAULT_FOOD_DATABASE.find((f) => f.id === foodId);
    if (!defaultItem) return;
    const existingIndex = foodDatabase.findIndex((f) => f.id === foodId);
    let updatedDatabase: FoodItem[];
    if (existingIndex >= 0) {
      updatedDatabase = [...foodDatabase];
      updatedDatabase[existingIndex] = { ...defaultItem };
    } else {
      updatedDatabase = [...foodDatabase, { ...defaultItem }];
    }
    setFoodDatabase(updatedDatabase);
    saveFoodDatabase(updatedDatabase);
  };

  const handleResetDatabase = (mode: ResetDatabaseMode, resetTodayMeals?: boolean) => {
    const restored = resetFoodDatabase(mode);
    setFoodDatabase(restored);

    if (resetTodayMeals) {
      const updatedLogs = resetDayLog(selectedDate);
      setDayLogs(updatedLogs);
    }
  };

  const handleToggleFavorite = (foodId: string) => {
    const updatedDatabase = foodDatabase.map((food) => {
      if (food.id === foodId) {
        return { ...food, isFavorite: !food.isFavorite };
      }
      return food;
    });
    setFoodDatabase(updatedDatabase);
    saveFoodDatabase(updatedDatabase);
  };

  const handleQuickLogFromDatabase = (food: FoodItem) => {
    setActiveMealType('obed');
    handleAddMealEntry({
      foodItem: food,
      portionGrams: food.defaultPortionGrams || 100,
      portionUnit: food.servingUnit || 'g',
      mealType: 'obed',
    });
    setActiveTab('diary');
  };

  // Handlers: Barcode Scan Results
  const handleAddMealFromBarcode = (food: FoodItem, portionGrams: number, mealType: MealType) => {
    // If not in database, also save to database
    if (!foodDatabase.some((f) => f.id === food.id || (food.barcode && f.barcode === food.barcode))) {
      handleSaveFood(food);
    }
    handleAddMealEntry({
      foodItem: food,
      portionGrams,
      portionUnit: food.servingUnit || 'g',
      mealType,
    });
    setActiveTab('diary');
  };

  const handleOpenManualCreateWithBarcode = (barcode: string) => {
    setFoodToEdit(null);
    setCustomFoodBarcodePrefill(barcode);
    setIsCustomFoodModalOpen(true);
  };

  // Handlers: Logging Recipes and Days from Weekly Plan
  const handleLogRecipeToDiary = (recipe: PlannedRecipe) => {
    const customRecipeFood: FoodItem = {
      id: `plan_rec_${Date.now()}`,
      name: recipe.title,
      category: 'custom',
      caloriesPer100g: recipe.calories,
      proteinPer100g: recipe.protein,
      carbsPer100g: recipe.carbs,
      fatPer100g: recipe.fat,
      fiberPer100g: recipe.fiber,
      defaultPortionGrams: 100,
      servingUnit: 'porce',
    };

    handleAddMealEntry({
      foodItem: customRecipeFood,
      portionGrams: 100,
      portionUnit: 'porce',
      mealType: recipe.mealType,
    });

    setActiveTab('diary');
  };

  const handleLogDayToDiary = (dayPlan: DayPlan) => {
    dayPlan.meals.forEach((recipe) => {
      const foodItem: FoodItem = {
        id: `plan_meal_${recipe.id}_${Date.now()}`,
        name: recipe.title,
        category: 'custom',
        caloriesPer100g: recipe.calories,
        proteinPer100g: recipe.protein,
        carbsPer100g: recipe.carbs,
        fatPer100g: recipe.fat,
        fiberPer100g: recipe.fiber,
        defaultPortionGrams: 100,
        servingUnit: 'porce',
      };
      handleAddMealEntry({
        foodItem,
        portionGrams: 100,
        portionUnit: 'porce',
        mealType: recipe.mealType,
      });
    });

    setActiveTab('diary');
  };

  // Recommendations Handler
  const handleAddRecommendationToDiary = (rec: MealRecommendation, mealType: MealType) => {
    if (rec.quickAddFoods && rec.quickAddFoods.length > 0) {
      rec.quickAddFoods.forEach((item) => {
        const found = foodDatabase.find((f) => f.id === item.foodId);
        if (found) {
          handleAddMealEntry({
            foodItem: found,
            portionGrams: item.portionGrams,
            portionUnit: found.servingUnit || 'g',
            mealType,
          });
        }
      });
    } else {
      const customMealFood: FoodItem = {
        id: `rec_item_${Date.now()}`,
        name: rec.title,
        category: 'custom',
        caloriesPer100g: rec.calories,
        proteinPer100g: rec.protein,
        carbsPer100g: rec.carbs,
        fatPer100g: rec.fat,
        fiberPer100g: rec.fiber || 3,
        defaultPortionGrams: 100,
        servingUnit: 'porce',
      };
      handleAddMealEntry({
        foodItem: customMealFood,
        portionGrams: 100,
        portionUnit: 'porce',
        mealType,
      });
    }
  };

  const handleAddWeightEntry = (entry: WeightEntry) => {
    const updated = [...weightHistory.filter((w) => w.date !== entry.date), entry];
    setWeightHistory(updated);
    saveWeightHistory(updated);

    if (entry.date === today) {
      const updatedProfile = { ...profile, weightKg: entry.weightKg };
      setProfile(updatedProfile);
      saveUserProfile(updatedProfile);
    }
  };

  const handleDeleteWeightEntry = (date: string) => {
    const updated = weightHistory.filter((w) => w.date !== date);
    setWeightHistory(updated);
    saveWeightHistory(updated);
  };

  // Export / Import Data
  const handleExportData = () => {
    const exportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      profile,
      dayLogs,
      weightHistory,
      weeklyPlan,
      customFoods: foodDatabase.filter((f) => f.isCustom),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriplan_zaloha_${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) {
          setProfile(parsed.profile);
          saveUserProfile(parsed.profile);
        }
        if (parsed.dayLogs) {
          setDayLogs(parsed.dayLogs);
          saveDayLogs(parsed.dayLogs);
        }
        if (parsed.weightHistory) {
          setWeightHistory(parsed.weightHistory);
          saveWeightHistory(parsed.weightHistory);
        }
        if (parsed.weeklyPlan) {
          setWeeklyPlan(parsed.weeklyPlan);
          saveWeeklyPlan(parsed.weeklyPlan);
        }
        if (parsed.customFoods && Array.isArray(parsed.customFoods)) {
          const merged = [...parsed.customFoods, ...foodDatabase.filter((f) => !f.isCustom)];
          setFoodDatabase(merged);
          saveFoodDatabase(merged);
        }
        alert('Data byla úspěšně načtena ze souboru.');
      } catch (err) {
        alert('Chyba při čtení JSON souboru. Zkontroluj formát.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        todayDate={today}
        onOpenBarcodeScanner={() => handleOpenBarcodeScanner('obed')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'diary' && (
          <DailyDiaryView
            dayLog={currentDayLog}
            targets={targets}
            totals={currentTotals}
            userWeightKg={profile.weightKg}
            onOpenAddMealModal={handleOpenAddMeal}
            onOpenBarcodeScanner={() => handleOpenBarcodeScanner(activeMealType)}
            onDeleteMealEntry={handleDeleteMealEntry}
            onAddExercise={handleAddExercise}
            onDeleteExercise={handleDeleteExercise}
            onUpdateWater={handleUpdateWater}
            onUpdateDailyWeight={handleUpdateDailyWeight}
            onUpdateDailyNote={handleUpdateDailyNote}
            onNavigateToAdvisor={() => setActiveTab('advisor')}
          />
        )}

        {activeTab === 'plan' && (
          <WeeklyPlanView
            profile={profile}
            dailyTargetCalories={targets.calories}
            savedPlan={weeklyPlan}
            onSavePlan={handleSaveWeeklyPlan}
            onLogRecipeToDiary={handleLogRecipeToDiary}
            onLogDayToDiary={handleLogDayToDiary}
          />
        )}

        {activeTab === 'advisor' && (
          <MealAdvisorView
            targets={targets}
            totals={currentTotals}
            userGoal={profile.goal}
            foodDatabase={foodDatabase}
            onAddRecommendationToDiary={handleAddRecommendationToDiary}
          />
        )}

        {activeTab === 'database' && (
          <FoodDatabaseView
            foodDatabase={foodDatabase}
            onOpenCreateFoodModal={handleOpenCreateFoodModal}
            onEditFood={handleOpenEditFoodModal}
            onDeleteFood={handleDeleteFood}
            onRestoreSingleDefaultFood={handleRestoreSingleDefaultFood}
            onResetDatabase={handleResetDatabase}
            onToggleFavorite={handleToggleFavorite}
            onQuickLogFood={handleQuickLogFromDatabase}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressChartsView
            profile={profile}
            targets={targets}
            dayLogs={dayLogs}
            weightHistory={weightHistory}
            onAddWeightEntry={handleAddWeightEntry}
            onDeleteWeightEntry={handleDeleteWeightEntry}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileAnalysisView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={isAddMealModalOpen}
        onClose={() => setIsAddMealModalOpen(false)}
        mealType={activeMealType}
        foodDatabase={foodDatabase}
        onAddMeal={handleAddMealEntry}
        onOpenCustomFoodModal={handleOpenCreateFoodModal}
        onEditFood={handleOpenEditFoodModal}
        onToggleFavorite={handleToggleFavorite}
        onOpenBarcodeScanner={() => handleOpenBarcodeScanner(activeMealType)}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        foodDatabase={foodDatabase}
        targetMealType={barcodeTargetMeal}
        onAddMealFromBarcode={handleAddMealFromBarcode}
        onSaveFoodToDatabase={handleSaveFood}
        onOpenManualCreateWithBarcode={handleOpenManualCreateWithBarcode}
      />

      {/* Food Creation & Editing Modal */}
      <CustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onClose={() => {
          setIsCustomFoodModalOpen(false);
          setFoodToEdit(null);
          setCustomFoodBarcodePrefill(undefined);
        }}
        onSaveFood={handleSaveFood}
        onDeleteFood={handleDeleteFood}
        foodToEdit={foodToEdit}
        initialBarcode={customFoodBarcodePrefill}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NutriPlan © Kalorické tabulky, Trénink & Osobní výživový rádce</span>
          <span className="text-slate-600">Výpočty postaveny na rovnici Mifflin-St Jeor, standardech MET & OpenFoodFacts</span>
        </div>
      </footer>
    </div>
  );
}
