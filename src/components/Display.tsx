import React, { useState } from 'react';
import { Copy, Check, Hash, CornerDownLeft, Sparkles } from 'lucide-react';
import { AngleUnit, NotationFormat } from '../types/calculator';
import { decimalToFraction } from '../utils/mathEngine';

interface DisplayProps {
  expression: string;
  result: string;
  rawResultNum: number | null;
  previewResult: number | undefined;
  previewError: string | undefined;
  angleUnit: AngleUnit;
  notation: NotationFormat;
  is2ndActive: boolean;
  isHypActive: boolean;
  hasMemory: boolean;
  onClear: () => void;
  onBackspace: () => void;
  onCopyResult: () => void;
  onRecallAns: () => void;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  rawResultNum,
  previewResult,
  previewError,
  angleUnit,
  notation,
  is2ndActive,
  isHypActive,
  hasMemory,
  onClear,
  onBackspace,
  onCopyResult,
  onRecallAns,
}) => {
  const [copied, setCopied] = useState(false);
  const [showFraction, setShowFraction] = useState(false);

  // Calculate unclosed parentheses count
  const openParens = (expression.match(/\(/g) || []).length;
  const closedParens = (expression.match(/\)/g) || []).length;
  const unclosedCount = Math.max(0, openParens - closedParens);

  const handleCopy = () => {
    onCopyResult();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const fractionVal = rawResultNum !== null ? decimalToFraction(rawResultNum) : null;
  const displayedValue = showFraction && fractionVal ? fractionVal : result;

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/90 border border-slate-800/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md overflow-hidden select-text">
      {/* Subtle background ambient light */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Top Status Bar: Mode, Notation, Memory, Function toggles */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 pb-2 border-b border-slate-800/60 mb-3 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
            {angleUnit}
          </span>
          <span className="uppercase text-slate-500">{notation}</span>
          {hasMemory && (
            <span className="text-amber-400 font-bold px-1 py-0.2 bg-amber-950/60 rounded border border-amber-800/40 text-[10px]">
              M
            </span>
          )}
          {is2ndActive && (
            <span className="text-cyan-300 font-bold px-1 py-0.2 bg-cyan-950/80 rounded border border-cyan-700/50 text-[10px]">
              2nd
            </span>
          )}
          {isHypActive && (
            <span className="text-purple-300 font-bold px-1 py-0.2 bg-purple-950/80 rounded border border-purple-700/50 text-[10px]">
              HYP
            </span>
          )}
        </div>

        {unclosedCount > 0 && (
          <div className="text-amber-400/90 text-[11px] flex items-center gap-1 font-mono">
            <span>Parens open:</span>
            <span className="font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/40">
              {unclosedCount}
            </span>
          </div>
        )}
      </div>

      {/* Primary Mathematical Expression */}
      <div className="min-h-[2.5rem] flex items-center justify-end text-right overflow-x-auto no-scrollbar scroll-smooth">
        <div className="font-mono text-base sm:text-xl text-slate-300 tracking-wide font-normal break-all">
          {expression ? (
            <span className="inline-block transition-all">
              {expression
                .replace(/\*/g, ' × ')
                .replace(/\//g, ' ÷ ')
                .replace(/\+/g, ' + ')
                .replace(/-/g, ' − ')}
            </span>
          ) : (
            <span className="text-slate-600 text-sm font-sans select-none">0</span>
          )}
        </div>
      </div>

      {/* Real-time Preview row */}
      <div className="h-6 flex items-center justify-end text-xs font-mono select-none">
        {expression && previewResult !== undefined && !result ? (
          <div className="flex items-center gap-1 text-cyan-400/80 animate-in fade-in duration-100">
            <span className="text-slate-500">=</span>
            <span className="font-medium tracking-tight">
              {previewResult.toLocaleString('en-US', { maximumFractionDigits: 8 })}
            </span>
          </div>
        ) : previewError && expression && !result ? (
          <span className="text-slate-500 text-[11px] italic">...</span>
        ) : null}
      </div>

      {/* Primary Evaluated Result Display */}
      <div className="flex items-baseline justify-end gap-2 overflow-x-auto no-scrollbar py-1">
        {result && (
          <span className="text-slate-600 text-xl font-mono select-none">=</span>
        )}
        <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white transition-all break-keep">
          {displayedValue || (previewResult !== undefined ? previewResult.toString() : '0')}
        </div>
      </div>

      {/* Bottom Display Quick Action Bar */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60 text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          {/* Fraction / Decimal Toggle Button */}
          {fractionVal && fractionVal !== result && (
            <button
              onClick={() => setShowFraction(!showFraction)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              title="Toggle Fraction / Decimal"
            >
              <Hash className="w-3 h-3 text-cyan-400" />
              <span>{showFraction ? 'Dec' : 'Frac'}</span>
            </button>
          )}

          {/* Previous Answer Recall */}
          <button
            onClick={onRecallAns}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="Recall Last Answer (Ans)"
          >
            Ans
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Result */}
          {result && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors text-xs"
              title="Copy result to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="font-sans text-[11px]">Copy</span>
                </>
              )}
            </button>
          )}

          {/* Clear & Backspace */}
          <button
            onClick={onBackspace}
            className="px-2.5 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-colors text-xs"
            title="Backspace (Delete single character)"
          >
            DEL
          </button>
          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors text-xs font-semibold"
            title="Clear all (AC)"
          >
            AC
          </button>
        </div>
      </div>
    </div>
  );
};
