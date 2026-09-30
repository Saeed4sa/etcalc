import React, { useState } from 'react';
import {
  Calculator,
  LineChart,
  Binary,
  Layers,
  BarChart3,
  Volume2,
  VolumeX,
  History,
  Keyboard,
  Palette,
  Check,
} from 'lucide-react';
import { CalculatorMode, AngleUnit, NotationFormat, ThemeName } from '../types/calculator';
import { PWAInstallButton } from './PWAInstallButton';
import { ConnectionStatusBadge } from './OfflineIndicator';

interface HeaderProps {
  mode: CalculatorMode;
  setMode: (mode: CalculatorMode) => void;
  angleUnit: AngleUnit;
  setAngleUnit: (unit: AngleUnit) => void;
  notation: NotationFormat;
  setNotation: (n: NotationFormat) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  historyCount: number;
  toggleHistory: () => void;
  isHistoryOpen: boolean;
  openKeyboardGuide: () => void;
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  angleUnit,
  setAngleUnit,
  notation,
  setNotation,
  soundEnabled,
  toggleSound,
  historyCount,
  toggleHistory,
  isHistoryOpen,
  openKeyboardGuide,
  currentTheme,
  setTheme,
}) => {
  const [showThemePicker, setShowThemePicker] = useState(false);

  const themes: { id: ThemeName; name: string; color: string }[] = [
    { id: 'obsidian', name: 'Obsidian Cyan', color: 'bg-cyan-500' },
    { id: 'midnight', name: 'Midnight Blue', color: 'bg-blue-500' },
    { id: 'emerald', name: 'Quantum Mint', color: 'bg-emerald-500' },
    { id: 'cyber', name: 'Solar Amber', color: 'bg-amber-500' },
  ];

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-sm text-white font-mono">AETHER<span className="text-cyan-400">CALC</span></span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">PRO</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono hidden sm:block">Scientific Precision Engine</div>
          </div>
        </div>

        {/* Mode Selector Navigation */}
        <nav className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setMode('scientific')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'scientific'
                ? 'bg-slate-800 text-cyan-300 shadow-xs border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Scientific</span>
          </button>

          <button
            onClick={() => setMode('graphing')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'graphing'
                ? 'bg-slate-800 text-cyan-300 shadow-xs border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Graphing</span>
          </button>

          <button
            onClick={() => setMode('programmer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'programmer'
                ? 'bg-slate-800 text-cyan-300 shadow-xs border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Base-N</span>
          </button>

          <button
            onClick={() => setMode('units')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'units'
                ? 'bg-slate-800 text-cyan-300 shadow-xs border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Units & Constants</span>
          </button>

          <button
            onClick={() => setMode('stats')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'stats'
                ? 'bg-slate-800 text-cyan-300 shadow-xs border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Stats & Matrix</span>
          </button>
        </nav>
      </div>

      {/* Control Tools */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Angle unit toggle (only applicable in scientific & graphing) */}
        {(mode === 'scientific' || mode === 'graphing') && (
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            {(['RAD', 'DEG', 'GRAD'] as AngleUnit[]).map(unit => (
              <button
                key={unit}
                onClick={() => setAngleUnit(unit)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  angleUnit === unit
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        )}

        {/* Notation selector (Norm / Sci / Eng / Fix) */}
        {mode === 'scientific' && (
          <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            {(['norm', 'sci', 'eng', 'fix'] as NotationFormat[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => setNotation(fmt)}
                className={`px-1.5 py-0.5 rounded text-[11px] uppercase transition-colors ${
                  notation === fmt
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        )}

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded-md border text-xs transition-colors ${
            soundEnabled
              ? 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
              : 'bg-slate-900/50 border-slate-800/60 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute Key Sounds' : 'Enable Key Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Keyboard Help */}
        <button
          onClick={openKeyboardGuide}
          className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Theme Palette"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {showThemePicker && (
            <div className="absolute right-0 mt-2 w-36 rounded-lg bg-slate-900 border border-slate-800 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">Themes</div>
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setShowThemePicker(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                    <span>{t.name}</span>
                  </div>
                  {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calculation History Drawer Button */}
        <button
          onClick={toggleHistory}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
            isHistoryOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="Toggle Calculation History"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="px-1 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              {historyCount}
            </span>
          )}
        </button>

        {/* PWA In-App Install Button */}
        <PWAInstallButton />

        {/* Connection status indicator */}
        <ConnectionStatusBadge />
      </div>
    </header>
  );
};
