import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanBarcode, 
  Camera, 
  Upload, 
  Search, 
  X, 
  Check, 
  Plus, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  Flame
} from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { FoodItem, MealType } from '../types/nutrition.ts';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodDatabase: FoodItem[];
  onAddMealFromBarcode: (food: FoodItem, portionGrams: number, mealType: MealType) => void;
  onSaveFoodToDatabase: (food: FoodItem) => void;
  onOpenManualCreateWithBarcode: (barcode: string) => void;
  targetMealType?: MealType;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  foodDatabase,
  onAddMealFromBarcode,
  onSaveFoodToDatabase,
  onOpenManualCreateWithBarcode,
  targetMealType = 'obed',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual' | 'upload'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingLookup, setIsLoadingLookup] = useState(false);

  // Result state
  const [foundFood, setFoundFood] = useState<FoodItem | null>(null);
  const [lookupNotFoundCode, setLookupNotFoundCode] = useState<string | null>(null);
  const [portionInput, setPortionInput] = useState('100');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(targetMealType);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  // Stop camera stream safely
  const stopScanner = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        // ignore
      }
      controlsRef.current = null;
    }
    setIsScanning(false);
  };

  // Start ZXing camera scanner
  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const videoElement = videoRef.current;
      if (!videoElement) return;

      const controls = await codeReaderRef.current.decodeFromVideoDevice(
        undefined, // default camera (environment / back camera when mobile)
        videoElement,
        (result, error) => {
          if (result) {
            const text = result.getText();
            stopScanner();
            handleLookupBarcode(text);
          }
        }
      );
      controlsRef.current = controls;
    } catch (err: any) {
      console.warn('Camera error or permission denied:', err);
      setCameraError('Nepodařilo se spustit kameru (povolte přístup k fotoaparátu v prohlížeči, nebo zadejte kód ručně).');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab]);

  // Lookup logic: Local DB first, then OpenFoodFacts
  const handleLookupBarcode = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    setIsLoadingLookup(true);
    setFoundFood(null);
    setLookupNotFoundCode(null);

    // 1. Check local database
    const localMatch = foodDatabase.find((f) => f.barcode === code);
    if (localMatch) {
      setFoundFood(localMatch);
      setPortionInput(String(localMatch.defaultPortionGrams || 100));
      setIsLoadingLookup(false);
      return;
    }

    // 2. Query OpenFoodFacts API
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) {
          const p = data.product;
          const nutriments = p.nutriments || {};

          // Extract values per 100g
          const calories = Math.round(
            nutriments['energy-kcal_100g'] ?? 
            (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)
          );
          const protein = Math.round((nutriments['proteins_100g'] ?? 0) * 10) / 10;
          const carbs = Math.round((nutriments['carbohydrates_100g'] ?? 0) * 10) / 10;
          const fat = Math.round((nutriments['fat_100g'] ?? 0) * 10) / 10;
          const fiber = Math.round((nutriments['fiber_100g'] ?? 0) * 10) / 10;

          const productName = p.product_name_cs || p.product_name || `Produkt ${code}`;
          const brand = p.brands || undefined;

          const importedFood: FoodItem = {
            id: `off_${code}_${Date.now()}`,
            name: productName,
            brand,
            barcode: code,
            category: 'custom',
            caloriesPer100g: calories,
            proteinPer100g: protein,
            carbsPer100g: carbs,
            fatPer100g: fat,
            fiberPer100g: fiber,
            defaultPortionGrams: 100,
            servingUnit: 'g',
            imageUrl: p.image_front_small_url || p.image_url,
            isCustom: true,
          };

          setFoundFood(importedFood);
          setPortionInput('100');
          setIsLoadingLookup(false);
          return;
        }
      }
    } catch (e) {
      console.warn('OpenFoodFacts fetch error:', e);
    }

    // 3. Not found anywhere
    setLookupNotFoundCode(code);
    setIsLoadingLookup(false);
  };

  // Upload barcode image handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoadingLookup(true);
      const reader = new BrowserMultiFormatReader();
      const imageUrl = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);

      if (result) {
        handleLookupBarcode(result.getText());
      }
    } catch (err) {
      alert('Na obrázku se nepodařilo detekovat čárový kód. Zkuste zadat kód ručně.');
      setIsLoadingLookup(false);
    }
  };

  const handleConfirmAddToDiary = () => {
    if (!foundFood) return;
    const portion = Math.max(1, parseFloat(portionInput) || 100);
    onAddMealFromBarcode(foundFood, portion, selectedMealType);
    onClose();
  };

  const handleSaveToCatalogOnly = () => {
    if (!foundFood) return;
    onSaveFoodToDatabase(foundFood);
    alert(`Potravina „${foundFood.name}“ byla uložena do tvé databáze!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="barcode-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h2 id="barcode-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
              <ScanBarcode className="w-5 h-5 text-emerald-400" />
              Skenování čárového kódu potraviny
            </h2>
            <p className="text-xs text-slate-400">Okamžité načtení nutričních hodnot z databáze a OpenFoodFacts</p>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            aria-label="Zavřít okno"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'camera'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Fotoaparát / Kamera</span>
          </button>

          <button
            onClick={() => {
              stopScanner();
              setActiveTab('manual');
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'manual'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Zadat EAN ručně</span>
          </button>

          <button
            onClick={() => {
              stopScanner();
              setActiveTab('upload');
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Nahrát foto</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-slate-700/80 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Viewfinder crosshairs and scanner laser effect */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="w-3/4 h-3/4 border-2 border-emerald-400/80 rounded-2xl relative shadow-lg">
                    {/* Pulsing laser line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="absolute bottom-2 inset-x-0 text-center text-[11px] font-bold text-white bg-slate-950/80 mx-auto w-max px-2 py-0.5 rounded">
                      Namiřte na čárový kód výrobku
                    </span>
                  </div>
                </div>

                {isScanning && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded-lg flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Hledám čárový kód...</span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p>{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('manual')}
                      className="mt-1 font-bold underline hover:text-white"
                    >
                      Přejít na ruční zadání kódu EAN →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MANUAL ENTRY TAB */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="manual-barcode-input" className="text-xs font-semibold text-slate-300">
                  Číslo čárového kódu (EAN-13 nebo EAN-8)
                </label>
                <div className="flex gap-2">
                  <input
                    id="manual-barcode-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="Např. 8594008270010 nebo 8593893701234"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupBarcode(manualCode)}
                    disabled={!manualCode.trim() || isLoadingLookup}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Vyhledat
                  </button>
                </div>
              </div>

              {/* Quick sample barcodes for testing */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Vyzkoušet ukázkový kód z databáze:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('8594008270010');
                      handleLookupBarcode('8594008270010');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500"
                  >
                    Kuřecí prsa (8594008270010)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('8594008270034');
                      handleLookupBarcode('8594008270034');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500"
                  >
                    Odtučněný tvaroh (8594008270034)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualCode('8594008270027');
                      handleLookupBarcode('8594008270027');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500"
                  >
                    Krůtí prsa (8594008270027)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* UPLOAD PHOTO TAB */}
          {activeTab === 'upload' && (
            <div className="p-6 border-2 border-dashed border-slate-700 rounded-2xl text-center space-y-3">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-white">Vyberte fotografii obalu nebo čárového kódu</p>
                <p className="text-xs text-slate-400 mt-0.5">Podporuje formáty JPG, PNG, WEBP</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-600 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Nahrát soubor</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* LOOKUP LOADING */}
          {isLoadingLookup && (
            <div className="p-6 bg-slate-850 rounded-2xl text-center space-y-2 border border-slate-800 animate-pulse">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300">Vyhledávám potravinu v databázi a mezinárodním registru...</p>
            </div>
          )}

          {/* PRODUCT FOUND CARD */}
          {foundFood && !isLoadingLookup && (
            <div className="bg-slate-850 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {foundFood.imageUrl ? (
                    <img
                      src={foundFood.imageUrl}
                      alt={foundFood.name}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-700 bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <Check className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Potravina nalezena
                    </span>
                    <h3 className="font-bold text-white text-base mt-1">{foundFood.name}</h3>
                    {foundFood.brand && (
                      <span className="text-xs text-slate-400">Výrobce: {foundFood.brand}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 block">{foundFood.caloriesPer100g}</span>
                  <span className="text-[10px] text-slate-400">kcal / 100g</span>
                </div>
              </div>

              {/* Nutrients on 100g */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Bílkoviny</span>
                  <span className="font-bold text-sky-400">{foundFood.proteinPer100g}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Sacharidy</span>
                  <span className="font-bold text-amber-400">{foundFood.carbsPer100g}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tuky</span>
                  <span className="font-bold text-rose-400">{foundFood.fatPer100g}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Vláknina</span>
                  <span className="font-bold text-emerald-300">{foundFood.fiberPer100g}g</span>
                </div>
              </div>

              {/* Portion selector & Meal slot for Diary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div className="space-y-1">
                  <label htmlFor="barcode-portion-input" className="text-xs font-semibold text-slate-300">Zapsat množství:</label>
                  <div className="relative">
                    <input
                      id="barcode-portion-input"
                      type="number"
                      min="1"
                      value={portionInput}
                      onChange={(e) => setPortionInput(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">g</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="barcode-meal-slot" className="text-xs font-semibold text-slate-300">Část dne:</label>
                  <select
                    id="barcode-meal-slot"
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="snidane">Snídaně</option>
                    <option value="svacina_dopoledne">Dopolední svačina</option>
                    <option value="obed">Oběd</option>
                    <option value="svacina_odpoledne">Odpolední svačina</option>
                    <option value="vecere">Večeře</option>
                    <option value="druha_vecere">Druhá večeře</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmAddToDiary}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Zapsat do deníku</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToCatalogOnly}
                  className="w-full sm:w-auto py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  Uložit do mých potravin
                </button>
              </div>
            </div>
          )}

          {/* NOT FOUND CARD (Fallback as requested by user) */}
          {lookupNotFoundCode && !isLoadingLookup && (
            <div className="bg-slate-850 border border-amber-500/40 rounded-2xl p-5 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Potravina s kódem <span className="font-mono text-amber-300">{lookupNotFoundCode}</span> zatím není v databázi
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Můžete ji nyní jedním kliknutím manuálně vytvořit a uložit pro další použití.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  onClose();
                  onOpenManualCreateWithBarcode(lookupNotFoundCode);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Přidat tuto potravinu manuálně</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
