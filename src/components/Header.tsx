import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  BookOpen, 
  Sparkles, 
  Database, 
  TrendingUp, 
  UserCheck,
  CalendarDays,
  ScanBarcode
} from 'lucide-react';

export type ActiveTabType = 'diary' | 'plan' | 'advisor' | 'database' | 'progress' | 'profile';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  todayDate: string;
  onOpenBarcodeScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  activeTab,
  onTabChange,
  todayDate,
  onOpenBarcodeScanner,
}) => {
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    onDateChange(todayDate);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (dateStr === todayDate) return 'Dnes';
    const d = new Date(dateStr);
    const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
    const monthNames = [
      'ledna', 'února', 'března', 'dubna', 'května', 'června',
      'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
    ];
    return `${dayNames[d.getDay()]}, ${d.getDate()}. ${monthNames[d.getMonth()]}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('diary')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  NutriPlan
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Kalorické tabulky
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Chytrá výživa, trénink & jídelníčky</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={handlePrevDay}
              aria-label="Předchozí den"
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleSetToday}
              className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                selectedDate === todayDate
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-700/40'
              }`}
            >
              {formatDateDisplay(selectedDate)}
            </button>

            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                aria-label="Vybrat datum"
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <span className="p-1.5 text-slate-400 hover:text-emerald-400 cursor-pointer">
                <Calendar className="w-4 h-4" />
              </span>
            </div>

            <button
              onClick={handleNextDay}
              aria-label="Následující den"
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBarcodeScanner}
              title="Skenovat čárový kód fotoaparátem"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold text-xs sm:text-sm rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <ScanBarcode className="w-4 h-4" />
              <span className="hidden sm:inline">Skenovat kód</span>
            </button>

            <button
              onClick={() => onTabChange('profile')}
              aria-label="Otevřít můj profil a analýzu"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                activeTab === 'profile'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Profil & Analýza</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 py-2.5 overflow-x-auto scrollbar-none border-t border-slate-800/80 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onTabChange('diary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'diary'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Deník jídel & Cvičení</span>
          </button>

          <button
            onClick={() => onTabChange('plan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'plan'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-md shadow-teal-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-teal-300" />
            <span>Týdenní jídelníček & Recepty</span>
          </button>

          <button
            onClick={() => onTabChange('advisor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'advisor'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Doporučení & AI Kuchař</span>
          </button>

          <button
            onClick={() => onTabChange('database')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'database'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Databáze & Editace potravin</span>
          </button>

          <button
            onClick={() => onTabChange('progress')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'progress'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Pokroky & Grafy</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
