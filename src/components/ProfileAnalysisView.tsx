import React, { useState } from 'react';
import { 
  UserCheck, 
  Activity, 
  Flame, 
  Target, 
  Sliders, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Scale, 
  Heart,
  Droplets,
  Sparkles,
  Info
} from 'lucide-react';
import { ActivityLevel, DailyTargets, FitnessGoal, Gender, UserProfile } from '../types/nutrition.ts';
import { calculateBMI, calculateBMR, calculateDailyTargets, calculateTDEE } from '../utils/nutritionCalculations.ts';

interface ProfileAnalysisViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDemoData: () => void;
}

export const ProfileAnalysisView: React.FC<ProfileAnalysisViewProps> = ({
  profile,
  onUpdateProfile,
  onExportData,
  onImportData,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live calculated values based on form inputs
  const liveBMR = calculateBMR({
    gender: formData.gender,
    weightKg: formData.weightKg,
    heightCm: formData.heightCm,
    ageYears: formData.ageYears,
  });

  const liveTDEE = calculateTDEE(liveBMR, formData.activityLevel);
  const liveTargets = calculateDailyTargets(formData);
  const liveBMI = calculateBMI(formData.weightKg, formData.heightCm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Tělesné parametry & Metabolická analýza
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-heading">
            Osobní profil a výpočet denních potřeb
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Zadej své přesné údaje pro automatické stanovení optimálního kalorického deficitu nebo nadbytku a poměru živin.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold text-xs rounded-xl animate-in fade-in">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Údaje byly uloženy</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Základní údaje
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-1">
              <label htmlFor="user-gender" className="text-xs font-semibold text-slate-300">Pohlaví</label>
              <select
                id="user-gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="male">Muž</option>
                <option value="female">Žena</option>
              </select>
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label htmlFor="user-age" className="text-xs font-semibold text-slate-300">Věk (roky)</label>
              <input
                id="user-age"
                type="number"
                min="12"
                max="110"
                value={formData.ageYears}
                onChange={(e) => setFormData({ ...formData, ageYears: parseInt(e.target.value) || 25 })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Height */}
            <div className="space-y-1">
              <label htmlFor="user-height" className="text-xs font-semibold text-slate-300">Výška (cm)</label>
              <input
                id="user-height"
                type="number"
                min="100"
                max="250"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value) || 175 })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Weight */}
            <div className="space-y-1">
              <label htmlFor="user-weight" className="text-xs font-semibold text-slate-300">Aktuální váha (kg)</label>
              <input
                id="user-weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 75 })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Target Weight */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="user-target-weight" className="text-xs font-semibold text-slate-300">Cílová vysněná váha (kg)</label>
              <input
                id="user-target-weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.targetWeightKg}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || 70 })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold text-teal-300 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-1">
            <label htmlFor="user-activity" className="text-xs font-semibold text-slate-300">
              Úroveň běžné fyzické aktivity
            </label>
            <select
              id="user-activity"
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="sedentary">Sedavé zaměstnání (kancelář, téměř žádný sport)</option>
              <option value="light">Lehká aktivita (chůze, 1–3 lehké tréninky týdně)</option>
              <option value="moderate">Střední aktivita (3–5 tréninků týdně, aktivní den)</option>
              <option value="very_active">Vysoká aktivita (6–7 intenzivních tréninků týdně)</option>
              <option value="extra_active">Extrémní zátěž (těžká manuální práce + každodenní sport)</option>
            </select>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-1">
            <label htmlFor="user-goal" className="text-xs font-semibold text-slate-300">
              Tvůj hlavní cíl
            </label>
            <select
              id="user-goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value as FitnessGoal })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="lose_moderate">Mírné hubnutí (-0.5 kg za týden - doporučeno)</option>
              <option value="lose_fast">Rychlé hubnutí (-0.8 kg za týden - vyšší deficit)</option>
              <option value="maintain">Udržování stávající tělesné hmotnosti</option>
              <option value="gain_moderate">Mírné nabírání svalové hmoty (+0.25 kg za týden)</option>
              <option value="gain_fast">Rychlejší nabírání hmotnosti (+0.5 kg za týden)</option>
            </select>
          </div>

          {/* Custom Targets Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.customTargetsEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setFormData({
                    ...formData,
                    customTargetsEnabled: enabled,
                    customTargets: enabled ? (formData.customTargets || liveTargets) : undefined,
                  });
                }}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-300">
                Přeji si manuálně upravit cílové kalorie a makroživiny (pokročilé)
              </span>
            </label>

            {formData.customTargetsEnabled && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-700 mt-3">
                <div className="space-y-1">
                  <label htmlFor="custom-calories" className="text-[11px] text-slate-400">Kalorie (kcal)</label>
                  <input
                    id="custom-calories"
                    type="number"
                    value={formData.customTargets?.calories || liveTargets.calories}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTargets: {
                        ...(formData.customTargets || liveTargets),
                        calories: parseInt(e.target.value) || 2000,
                      },
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-protein" className="text-[11px] text-slate-400">Bílkoviny (g)</label>
                  <input
                    id="custom-protein"
                    type="number"
                    value={formData.customTargets?.proteinGrams || liveTargets.proteinGrams}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTargets: {
                        ...(formData.customTargets || liveTargets),
                        proteinGrams: parseInt(e.target.value) || 140,
                      },
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-sky-400"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-carbs" className="text-[11px] text-slate-400">Sacharidy (g)</label>
                  <input
                    id="custom-carbs"
                    type="number"
                    value={formData.customTargets?.carbsGrams || liveTargets.carbsGrams}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTargets: {
                        ...(formData.customTargets || liveTargets),
                        carbsGrams: parseInt(e.target.value) || 200,
                      },
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-fat" className="text-[11px] text-slate-400">Tuky (g)</label>
                  <input
                    id="custom-fat"
                    type="number"
                    value={formData.customTargets?.fatGrams || liveTargets.fatGrams}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTargets: {
                        ...(formData.customTargets || liveTargets),
                        fatGrams: parseInt(e.target.value) || 60,
                      },
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-rose-400"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-fiber" className="text-[11px] text-slate-400">Vláknina (g)</label>
                  <input
                    id="custom-fiber"
                    type="number"
                    value={formData.customTargets?.fiberGrams || liveTargets.fiberGrams}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTargets: {
                        ...(formData.customTargets || liveTargets),
                        fiberGrams: parseInt(e.target.value) || 28,
                      },
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-emerald-300"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-water" className="text-[11px] text-slate-400">Voda (ml)</label>
                  <input
                    id="custom-water"
                    type="number"
                    value={formData.customTargets?.waterMl || liveTargets.waterMl}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTargets: {
                        ...(formData.customTargets || liveTargets),
                        waterMl: parseInt(e.target.value) || 2500,
                      },
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-2xl text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            Uložit a přepočítat plán
          </button>
        </form>

        {/* Right Column: Metabolic Breakdown Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* BMI Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                BMI Index
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 ${liveBMI.color}`}>
                {liveBMI.category}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-heading">{liveBMI.bmi}</span>
              <span className="text-xs text-slate-400">kg/m²</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Normální váha je standardně v rozmezí BMI 18.5 – 24.9.
            </p>
          </div>

          {/* BMR & TDEE Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              Metabolický výdej (Mifflin-St Jeor)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <span className="block text-[11px] text-slate-400">Bazální metabolismus (BMR)</span>
                <span className="text-xl font-black text-white">{liveBMR} <span className="text-xs font-normal text-slate-400">kcal</span></span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Spotřeba v úplném klidu</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <span className="block text-[11px] text-slate-400">Celkový výdej (TDEE)</span>
                <span className="text-xl font-black text-teal-300">{liveTDEE} <span className="text-xs font-normal text-slate-400">kcal</span></span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Včetně tvého pohybu</span>
              </div>
            </div>

            {/* Target Recommendation */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400">Tvůj denní cíl</span>
                  <div className="text-2xl font-black text-white">{liveTargets.calories} kcal/den</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-300 block">
                    {liveTargets.calories < liveTDEE ? 'Deficit' : liveTargets.calories > liveTDEE ? 'Surplus' : 'Udržování'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {liveTargets.calories - liveTDEE > 0 ? `+${liveTargets.calories - liveTDEE}` : liveTargets.calories - liveTDEE} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Target Macros Breakdown */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Bílkoviny (protein)
                </span>
                <span className="font-bold text-sky-400">{liveTargets.proteinGrams} g ({liveTargets.proteinGrams * 4} kcal)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Sacharidy
                </span>
                <span className="font-bold text-amber-400">{liveTargets.carbsGrams} g ({liveTargets.carbsGrams * 4} kcal)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Tuky
                </span>
                <span className="font-bold text-rose-400">{liveTargets.fatGrams} g ({liveTargets.fatGrams * 9} kcal)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Vláknina
                </span>
                <span className="font-bold text-emerald-300">{liveTargets.fiberGrams} g</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Pitný režim
                </span>
                <span className="font-bold text-cyan-300">{liveTargets.waterMl} ml</span>
              </div>
            </div>
          </div>

          {/* Backup & Data Management Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Správa dat a zálohování
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportovat data</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Importovat</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Opravdu si přeješ obnovit výchozí ukázková data?')) {
                  onResetDemoData();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-slate-400 hover:text-rose-400 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Obnovit výchozí demo data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
