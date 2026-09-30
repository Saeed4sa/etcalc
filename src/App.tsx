/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalculatorMode,
  AngleUnit,
  NotationFormat,
  ThemeName,
  HistoryItem,
} from './types/calculator';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { ScientificKeypad } from './components/ScientificKeypad';
import { GraphingView } from './components/GraphingView';
import { ProgrammerView } from './components/ProgrammerView';
import { UnitsAndConstantsView } from './components/UnitsAndConstantsView';
import { StatsAndMatrixView } from './components/StatsAndMatrixView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { KeyboardGuideModal } from './components/KeyboardGuideModal';
import { SingleFileExportModal } from './components/SingleFileExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  evaluateExpression,
  previewExpression,
  formatResult,
} from './utils/mathEngine';
import { soundFx } from './utils/audio';

export default function App() {
  // Mode & configuration state
  const [mode, setMode] = useState<CalculatorMode>('scientific');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>(() => {
    try {
      return (localStorage.getItem('aethercalc_angle_unit') as AngleUnit) || 'DEG';
    } catch {
      return 'DEG';
    }
  });
  const [notation, setNotation] = useState<NotationFormat>('norm');
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      return (localStorage.getItem('aethercalc_theme') as ThemeName) || 'obsidian';
    } catch {
      return 'obsidian';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundFx.enabled);

  // Scientific calculation state
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [rawResultNum, setRawResultNum] = useState<number | null>(null);
  const [lastAns, setLastAns] = useState<number>(0);
  const [memory, setMemory] = useState<number>(0);

  // Keypad toggles
  const [is2nd, setIs2nd] = useState(false);
  const [isHyp, setIsHyp] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aethercalc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isKeyboardGuideOpen, setIsKeyboardGuideOpen] = useState(false);
  const [isSingleFileExportOpen, setIsSingleFileExportOpen] = useState(false);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aethercalc_history', JSON.stringify(history));
    } catch {
      // Ignore quota errors
    }
  }, [history]);

  // Save angle unit & theme
  useEffect(() => {
    try {
      localStorage.setItem('aethercalc_angle_unit', angleUnit);
    } catch {}
  }, [angleUnit]);

  useEffect(() => {
    try {
      localStorage.setItem('aethercalc_theme', theme);
    } catch {}
  }, [theme]);

  // Real-time preview calculation
  const { result: previewResult, error: previewError } = previewExpression(expression, angleUnit);

  // Insert token or text into current expression
  const handleInsert = useCallback(
    (text: string) => {
      // If we already have a calculated result and user types an operator, continue with Ans
      if (result && ['+', '-', '*', '/', '^', '%'].includes(text)) {
        setExpression(`Ans${text}`);
        setResult('');
        setRawResultNum(null);
        return;
      }
      // If result exists and user types a digit or function, start fresh
      if (result) {
        setExpression(text);
        setResult('');
        setRawResultNum(null);
        return;
      }

      setExpression(prev => prev + text);
    },
    [result]
  );

  // Clear All (AC)
  const handleClear = useCallback(() => {
    setExpression('');
    setResult('');
    setRawResultNum(null);
    setIs2nd(false);
    setIsHyp(false);
  }, []);

  // Backspace (DEL)
  const handleBackspace = useCallback(() => {
    if (result) {
      handleClear();
      return;
    }
    setExpression(prev => {
      if (prev.endsWith('sin(') || prev.endsWith('cos(') || prev.endsWith('tan(') || prev.endsWith('log(')) {
        return prev.slice(0, -4);
      }
      if (prev.endsWith('asin(') || prev.endsWith('acos(') || prev.endsWith('atan(') || prev.endsWith('sinh(') || prev.endsWith('cosh(') || prev.endsWith('tanh(')) {
        return prev.slice(0, -5);
      }
      if (prev.endsWith('sqrt(') || prev.endsWith('cbrt(')) {
        return prev.slice(0, -5);
      }
      if (prev.endsWith('ln(')) {
        return prev.slice(0, -3);
      }
      if (prev.endsWith('Ans')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  }, [result, handleClear]);

  // Calculate final result
  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    try {
      // Substitute 'Ans' with lastAns value
      const substituted = expression.replace(/Ans/g, `(${lastAns})`);
      const val = evaluateExpression(substituted, angleUnit);

      if (isNaN(val)) {
        setResult('Error: Undefined');
        setRawResultNum(null);
        return;
      }

      const formatted = formatResult(val, notation);
      setResult(formatted);
      setRawResultNum(val);
      setLastAns(val);

      // Record in history
      const newEntry: HistoryItem = {
        id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        expression,
        result: formatted,
        timestamp: Date.now(),
        angleUnit,
      };

      setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // keep last 50
    } catch (err: unknown) {
      setResult(err instanceof Error ? err.message : 'Syntax Error');
      setRawResultNum(null);
    }
  }, [expression, angleUnit, notation, lastAns]);

  // Memory Register Operations
  const handleMemoryClear = () => {
    soundFx.playClick(600);
    setMemory(0);
  };

  const handleMemoryRecall = () => {
    soundFx.playClick(620);
    handleInsert(memory.toString());
  };

  const handleMemoryAdd = () => {
    soundFx.playClick(640);
    const targetVal = rawResultNum !== null ? rawResultNum : previewResult ?? 0;
    setMemory(prev => prev + targetVal);
  };

  const handleMemorySubtract = () => {
    soundFx.playClick(640);
    const targetVal = rawResultNum !== null ? rawResultNum : previewResult ?? 0;
    setMemory(prev => prev - targetVal);
  };

  const handleMemoryStore = () => {
    soundFx.playClick(660);
    const targetVal = rawResultNum !== null ? rawResultNum : previewResult ?? 0;
    setMemory(targetVal);
  };

  // Sign Negation (±)
  const handleNegate = () => {
    if (result && rawResultNum !== null) {
      const negated = -rawResultNum;
      setExpression(negated.toString());
      setResult('');
      setRawResultNum(null);
      return;
    }
    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else if (expression.startsWith('-')) {
      setExpression(expression.slice(1));
    } else {
      setExpression(`-(${expression || '0'})`);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        soundFx.playClick(720);
        handleInsert(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        soundFx.playClick(720);
        handleInsert('.');
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert(e.key);
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert(e.key);
      } else if (e.key === '^') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('^');
      } else if (e.key === '%') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('%');
      } else if (e.key === '!') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('!');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        soundFx.playEquals();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        soundFx.playClick(500);
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        soundFx.playClear();
        handleClear();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('sin(');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('tan(');
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('π');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('ln(');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        soundFx.playClick(750);
        handleInsert('sqrt(');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInsert, handleCalculate, handleBackspace, handleClear]);

  // Theme styling classes
  const themeClasses: Record<ThemeName, string> = {
    obsidian: 'selection:bg-cyan-500/30 selection:text-cyan-200',
    midnight: 'selection:bg-blue-500/30 selection:text-blue-200',
    emerald: 'selection:bg-emerald-500/30 selection:text-emerald-200',
    cyber: 'selection:bg-amber-500/30 selection:text-amber-200',
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between font-sans ${themeClasses[theme]}`}>
      {/* Top Application Header */}
      <Header
        mode={mode}
        setMode={setMode}
        angleUnit={angleUnit}
        setAngleUnit={setAngleUnit}
        notation={notation}
        setNotation={setNotation}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled(soundFx.toggle())}
        historyCount={history.length}
        toggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        isHistoryOpen={isHistoryOpen}
        openKeyboardGuide={() => setIsKeyboardGuideOpen(true)}
        openSingleFileExport={() => setIsSingleFileExportOpen(true)}
        currentTheme={theme}
        setTheme={setTheme}
      />

      {/* Main Calculation Stage */}
      <main className="w-full max-w-4xl px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-start">
        {mode === 'scientific' && (
          <div className="w-full max-w-xl mx-auto flex flex-col gap-3.5 animate-in fade-in duration-150">
            {/* Display Visor */}
            <Display
              expression={expression}
              result={result}
              rawResultNum={rawResultNum}
              previewResult={previewResult}
              previewError={previewError}
              angleUnit={angleUnit}
              notation={notation}
              is2ndActive={is2nd}
              isHypActive={isHyp}
              hasMemory={memory !== 0}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onCopyResult={() => {
                if (result) navigator.clipboard.writeText(result);
              }}
              onRecallAns={() => handleInsert('Ans')}
            />

            {/* Scientific Keypad */}
            <ScientificKeypad
              onInsert={handleInsert}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onCalculate={handleCalculate}
              onMemoryClear={handleMemoryClear}
              onMemoryRecall={handleMemoryRecall}
              onMemoryAdd={handleMemoryAdd}
              onMemorySubtract={handleMemorySubtract}
              onMemoryStore={handleMemoryStore}
              is2nd={is2nd}
              toggle2nd={() => setIs2nd(!is2nd)}
              isHyp={isHyp}
              toggleHyp={() => setIsHyp(!isHyp)}
              onNegate={handleNegate}
            />
          </div>
        )}

        {mode === 'graphing' && (
          <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-150">
            <GraphingView angleUnit={angleUnit} />
          </div>
        )}

        {mode === 'programmer' && (
          <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-150">
            <ProgrammerView />
          </div>
        )}

        {mode === 'units' && (
          <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-150">
            <UnitsAndConstantsView
              onInsertValue={val => {
                setExpression(prev => prev + val);
                setMode('scientific');
              }}
            />
          </div>
        )}

        {mode === 'stats' && (
          <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-150">
            <StatsAndMatrixView
              onInsertValue={val => {
                setExpression(prev => prev + val);
                setMode('scientific');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer Info & Metadata */}
      <footer className="w-full py-2.5 px-4 border-t border-slate-900/80 bg-slate-950/60 backdrop-blur-xs flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span>AetherCalc Pro</span>
          <span aria-hidden="true">·</span>
          <span>Progressive Web App</span>
          <span aria-hidden="true">·</span>
          <span>Offline Ready</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span>Precision 64-bit IEEE 754</span>
          <span aria-hidden="true">·</span>
          <span>Continuous Fractions</span>
        </div>
      </footer>

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRecallExpression={expr => {
          setExpression(expr);
          setResult('');
          setIsHistoryOpen(false);
        }}
        onUseResult={res => {
          setExpression(prev => (prev ? `${prev}${res}` : res));
          setResult('');
          setIsHistoryOpen(false);
        }}
        onClearHistory={() => setHistory([])}
        onDeleteItem={id => setHistory(prev => prev.filter(item => item.id !== id))}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardGuideModal
        isOpen={isKeyboardGuideOpen}
        onClose={() => setIsKeyboardGuideOpen(false)}
      />

      {/* Standalone Single File HTML Export Modal */}
      <SingleFileExportModal
        isOpen={isSingleFileExportOpen}
        onClose={() => setIsSingleFileExportOpen(false)}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
