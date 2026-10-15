import type { ExerciseActivityType, ExerciseEntry, ExerciseIntensity } from '../types/nutrition.ts';

export interface ActivityMeta {
  type: ExerciseActivityType;
  label: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'sports';
  met: {
    low: number;
    moderate: number;
    high: number;
  };
  intensityLabels: {
    low: string;
    moderate: string;
    high: string;
  };
}

export const ACTIVITIES_DATABASE: Record<ExerciseActivityType, ActivityMeta> = {
  running: {
    type: 'running',
    label: 'Běh',
    category: 'cardio',
    met: { low: 7.0, moderate: 9.8, high: 12.0 },
    intensityLabels: {
      low: 'Pomalý běh / jogging (cca 8 km/h)',
      moderate: 'Střední tempo (cca 10 km/h)',
      high: 'Rychlý běh / intervaly (>12 km/h)',
    },
  },
  cycling: {
    type: 'cycling',
    label: 'Cyklistika / Spinning',
    category: 'cardio',
    met: { low: 5.5, moderate: 7.5, high: 10.5 },
    intensityLabels: {
      low: 'Rekreační jízda (<16 km/h)',
      moderate: 'Střední tempo (16–22 km/h)',
      high: 'Rychlá jízda / spinning do kopce',
    },
  },
  swimming: {
    type: 'swimming',
    label: 'Plavání',
    category: 'cardio',
    met: { low: 6.0, moderate: 8.0, high: 11.0 },
    intensityLabels: {
      low: 'Pohodové rekreační plavání',
      moderate: 'Pravidelná prsa / znak',
      high: 'Rychlý kraul / intervalový trénink',
    },
  },
  weightlifting: {
    type: 'weightlifting',
    label: 'Posilování / Silový trénink',
    category: 'strength',
    met: { low: 3.5, moderate: 5.0, high: 6.8 },
    intensityLabels: {
      low: 'Lehké cvičení s vlastní vahou / dlouhé pauzy',
      moderate: 'Standardní kulturistický trénink na strojcích',
      high: 'Těžký silový trénink / dřepy, mrtvé tahy',
    },
  },
  walking: {
    type: 'walking',
    label: 'Chůze / Turistika',
    category: 'cardio',
    met: { low: 3.0, moderate: 4.3, high: 6.5 },
    intensityLabels: {
      low: 'Pomalá procházka (cca 4 km/h)',
      moderate: 'Svižná chůze (cca 5.5 km/h)',
      high: 'Rychlá chůze do kopce / s batohem',
    },
  },
  hiit: {
    type: 'hiit',
    label: 'HIIT / Kruhový trénink',
    category: 'cardio',
    met: { low: 7.0, moderate: 9.5, high: 12.5 },
    intensityLabels: {
      low: 'Kruhový trénink s delšími pauzami',
      moderate: 'Tabata / intenzivní intervaly',
      high: 'Maximální zátěž bez odpočinku',
    },
  },
  yoga_pilates: {
    type: 'yoga_pilates',
    label: 'Jóga & Pilates / Strečink',
    category: 'flexibility',
    met: { low: 2.5, moderate: 3.5, high: 4.8 },
    intensityLabels: {
      low: 'Regenerační jemný strečink',
      moderate: 'Hatha jóga / standardní pilates',
      high: 'Power jóga / dynamická vinyasa',
    },
  },
  football: {
    type: 'football',
    label: 'Fotbal & Týmové míčové sporty',
    category: 'sports',
    met: { low: 6.0, moderate: 8.0, high: 10.5 },
    intensityLabels: {
      low: 'Rekreační kopání s přáteli',
      moderate: 'Zápasové tempo',
      high: 'Intenzivní soutěžní zápas',
    },
  },
  tennis: {
    type: 'tennis',
    label: 'Tenis / Squash / Badminton',
    category: 'sports',
    met: { low: 5.5, moderate: 7.3, high: 9.5 },
    intensityLabels: {
      low: 'Čtyřhra / rekreační výměny',
      moderate: 'Standardní dvouhra',
      high: 'Rychlý turnajový zápas / squash',
    },
  },
  boxing: {
    type: 'boxing',
    label: 'Box & Bojové sporty',
    category: 'strength',
    met: { low: 6.5, moderate: 9.0, high: 12.0 },
    intensityLabels: {
      low: 'Stínový box / nácvik techniky',
      moderate: 'Trénink na pytli / lapy',
      high: 'Tvrdý sparring / zápas',
    },
  },
  jump_rope: {
    type: 'jump_rope',
    label: 'Švihadlo',
    category: 'cardio',
    met: { low: 8.0, moderate: 11.0, high: 13.5 },
    intensityLabels: {
      low: 'Pomalé skákání (<100 přeskoků/min)',
      moderate: 'Střední tempo (100–120/min)',
      high: 'Rychlé dvojskoky / HIIT',
    },
  },
  rowing: {
    type: 'rowing',
    label: 'Veslování (trenažér)',
    category: 'cardio',
    met: { low: 4.8, moderate: 7.0, high: 10.0 },
    intensityLabels: {
      low: 'Lehké tempo (<100 wattů)',
      moderate: 'Střední tempo (100–150 wattů)',
      high: 'Maximální záběr / závody',
    },
  },
  custom: {
    type: 'custom',
    label: 'Vlastní aktivita',
    category: 'cardio',
    met: { low: 4.0, moderate: 6.0, high: 8.5 },
    intensityLabels: {
      low: 'Nízká intenzita',
      moderate: 'Střední intenzita',
      high: 'Vysoká intenzita',
    },
  },
};

/**
 * Calculates estimated calories burned using MET formula:
 * Calories = MET × weight(kg) × (minutes / 60)
 */
export function calculateExerciseCalories(params: {
  activityType: ExerciseActivityType;
  durationMinutes: number;
  intensity: ExerciseIntensity;
  weightKg: number;
}): number {
  const { activityType, durationMinutes, intensity, weightKg } = params;
  if (durationMinutes <= 0 || weightKg <= 0) return 0;

  const activity = ACTIVITIES_DATABASE[activityType] || ACTIVITIES_DATABASE.custom;
  const met = activity.met[intensity] || activity.met.moderate;

  const hours = durationMinutes / 60;
  const burned = met * weightKg * hours;
  return Math.round(burned);
}

/**
 * Calculates total duration and calories burned for an array of exercises.
 */
export function calculateDailyExerciseTotals(exercises?: ExerciseEntry[]): {
  totalMinutes: number;
  totalCaloriesBurned: number;
} {
  if (!exercises || exercises.length === 0) {
    return { totalMinutes: 0, totalCaloriesBurned: 0 };
  }

  return exercises.reduce(
    (acc, curr) => ({
      totalMinutes: acc.totalMinutes + (curr.durationMinutes || 0),
      totalCaloriesBurned: acc.totalCaloriesBurned + (curr.caloriesBurned || 0),
    }),
    { totalMinutes: 0, totalCaloriesBurned: 0 }
  );
}

/**
 * Calculates Net Calories and remaining balance with physical activity integrated.
 * Net Calories = Consumed Calories - Burned Calories
 * Remaining with Exercise = Target Calories - Net Calories = Target - Consumed + Burned
 */
export function calculateNetCalorieBalance(params: {
  consumedCalories: number;
  burnedCalories: number;
  targetCalories: number;
}): {
  netCalories: number;
  remainingCaloriesWithExercise: number;
  remainingCaloriesFoodOnly: number;
  exerciseDeficitBonus: number;
} {
  const { consumedCalories, burnedCalories, targetCalories } = params;

  const netCalories = Math.max(0, consumedCalories - burnedCalories);
  const remainingCaloriesFoodOnly = targetCalories - consumedCalories;
  const remainingCaloriesWithExercise = targetCalories - netCalories;

  return {
    netCalories,
    remainingCaloriesWithExercise,
    remainingCaloriesFoodOnly,
    exerciseDeficitBonus: burnedCalories,
  };
}
