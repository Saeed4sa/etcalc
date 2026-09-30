import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ScientificKeypadProps {
  onInsert: (text: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryStore: () => void;
  is2nd: boolean;
  toggle2nd: () => void;
  isHyp: boolean;
  toggleHyp: () => void;
  onNegate: () => void;
}

export const ScientificKeypad: React.FC<ScientificKeypadProps> = ({
  onInsert,
  onClear,
  onBackspace,
  onCalculate,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryStore,
  is2nd,
  toggle2nd,
  isHyp,
  toggleHyp,
  onNegate,
}) => {
  const handleKeyClick = (action: () => void, pitch: number = 750) => {
    soundFx.playClick(pitch);
    action();
  };

  const handleCalcClick = () => {
    soundFx.playEquals();
    onCalculate();
  };

  const handleClearClick = () => {
    soundFx.playClear();
    onClear();
  };

  // Base button styles
  const btnBase =
    'relative flex items-center justify-center rounded-xl font-mono text-xs sm:text-sm transition-all duration-75 active:scale-95 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 py-3 sm:py-3.5 shadow-sm';
  const btnSci =
    `${btnBase} bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/80 active:bg-slate-700`;
  const btnMem =
    `${btnBase} bg-slate-900/60 hover:bg-slate-800/80 text-amber-300/80 border border-slate-800/50 text-[11px] sm:text-xs`;
  const btnNum =
    `${btnBase} bg-slate-900 hover:bg-slate-800 text-white font-medium border border-slate-800/90 text-base sm:text-lg`;
  const btnOp =
    `${btnBase} bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/40 font-semibold text-base sm:text-lg`;

  return (
    <div className="w-full space-y-2 select-none">
      {/* Memory Register Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <button
          onClick={() => handleKeyClick(onMemoryClear, 600)}
          className={btnMem}
          title="Clear Memory (MC)"
        >
          MC
        </button>
        <button
          onClick={() => handleKeyClick(onMemoryRecall, 620)}
          className={btnMem}
          title="Recall Memory (MR)"
        >
          MR
        </button>
        <button
          onClick={() => handleKeyClick(onMemoryAdd, 640)}
          className={btnMem}
          title="Add to Memory (M+)"
        >
          M+
        </button>
        <button
          onClick={() => handleKeyClick(onMemorySubtract, 640)}
          className={btnMem}
          title="Subtract from Memory (M-)"
        >
          M−
        </button>
        <button
          onClick={() => handleKeyClick(onMemoryStore, 660)}
          className={btnMem}
          title="Store into Memory (MS)"
        >
          MS
        </button>
      </div>

      {/* Main Scientific Keypad Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {/* Row 1 */}
        <button
          onClick={() => handleKeyClick(toggle2nd, 850)}
          className={`${btnBase} ${
            is2nd
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/20 shadow-md'
              : 'bg-slate-900 text-cyan-400 border border-cyan-500/30'
          }`}
          title="Secondary functions toggle"
        >
          2nd
        </button>
        <button
          onClick={() => handleKeyClick(toggleHyp, 850)}
          className={`${btnBase} ${
            isHyp
              ? 'bg-purple-500 text-slate-950 font-bold shadow-purple-500/20 shadow-md'
              : 'bg-slate-900 text-purple-400 border border-purple-500/30'
          }`}
          title="Hyperbolic functions toggle"
        >
          HYP
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('('))}
          className={btnSci}
        >
          (
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert(')'))}
          className={btnSci}
        >
          )
        </button>
        <button
          onClick={() => handleKeyClick(onBackspace, 500)}
          className={`${btnSci} text-rose-300 sm:col-span-1`}
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={handleClearClick}
          className={`${btnBase} hidden sm:flex bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold`}
          title="All Clear"
        >
          AC
        </button>

        {/* Row 2: Trigonometric & Inverse Trig */}
        <button
          onClick={() =>
            handleKeyClick(() =>
              onInsert(
                isHyp
                  ? is2nd
                    ? 'asinh('
                    : 'sinh('
                  : is2nd
                  ? 'asin('
                  : 'sin('
              )
            )
          }
          className={btnSci}
        >
          {isHyp ? (is2nd ? 'sinh⁻¹' : 'sinh') : is2nd ? 'sin⁻¹' : 'sin'}
        </button>
        <button
          onClick={() =>
            handleKeyClick(() =>
              onInsert(
                isHyp
                  ? is2nd
                    ? 'acosh('
                    : 'cosh('
                  : is2nd
                  ? 'acos('
                  : 'cos('
              )
            )
          }
          className={btnSci}
        >
          {isHyp ? (is2nd ? 'cosh⁻¹' : 'cosh') : is2nd ? 'cos⁻¹' : 'cos'}
        </button>
        <button
          onClick={() =>
            handleKeyClick(() =>
              onInsert(
                isHyp
                  ? is2nd
                    ? 'atanh('
                    : 'tanh('
                  : is2nd
                  ? 'atan('
                  : 'tan('
              )
            )
          }
          className={btnSci}
        >
          {isHyp ? (is2nd ? 'tanh⁻¹' : 'tanh') : is2nd ? 'tan⁻¹' : 'tan'}
        </button>
        <button
          onClick={() =>
            handleKeyClick(() => onInsert(is2nd ? 'e^(' : 'ln('))
          }
          className={btnSci}
        >
          {is2nd ? 'eˣ' : 'ln'}
        </button>
        <button
          onClick={() =>
            handleKeyClick(() => onInsert(is2nd ? '10^(' : 'log10('))
          }
          className={btnSci}
        >
          {is2nd ? '10ˣ' : 'log'}
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('^'))}
          className={`${btnSci} hidden sm:flex`}
          title="x to the power y"
        >
          xʸ
        </button>

        {/* Row 3: Powers & Roots */}
        <button
          onClick={() =>
            handleKeyClick(() => onInsert(is2nd ? 'sqrt(' : '^2'))
          }
          className={btnSci}
        >
          {is2nd ? '√x' : 'x²'}
        </button>
        <button
          onClick={() =>
            handleKeyClick(() => onInsert(is2nd ? 'cbrt(' : '^3'))
          }
          className={btnSci}
        >
          {is2nd ? '∛x' : 'x³'}
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('^'))}
          className={`${btnSci} sm:hidden`}
        >
          xʸ
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('1/('))}
          className={btnSci}
        >
          1/x
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('abs('))}
          className={btnSci}
        >
          |x|
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('sqrt('))}
          className={`${btnSci} hidden sm:flex`}
        >
          √x
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('/'))}
          className={btnOp}
        >
          ÷
        </button>

        {/* Row 4: Digits 7, 8, 9 & Combinatorics */}
        <button
          onClick={() =>
            handleKeyClick(() => onInsert(is2nd ? 'nCr(' : 'nPr('))
          }
          className={btnSci}
        >
          {is2nd ? 'nCr' : 'nPr'}
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('7'), 700)}
          className={btnNum}
        >
          7
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('8'), 700)}
          className={btnNum}
        >
          8
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('9'), 700)}
          className={btnNum}
        >
          9
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('*'))}
          className={btnOp}
        >
          ×
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('!'))}
          className={`${btnSci} hidden sm:flex`}
        >
          n!
        </button>

        {/* Row 5: Digits 4, 5, 6 & Constants */}
        <button
          onClick={() => handleKeyClick(() => onInsert('!'))}
          className={`${btnSci} sm:hidden`}
        >
          n!
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('π'))}
          className={`${btnSci} hidden sm:flex`}
        >
          π
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('4'), 700)}
          className={btnNum}
        >
          4
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('5'), 700)}
          className={btnNum}
        >
          5
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('6'), 700)}
          className={btnNum}
        >
          6
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('-'))}
          className={btnOp}
        >
          −
        </button>

        {/* Row 6: Digits 1, 2, 3 & Mod */}
        <button
          onClick={() => handleKeyClick(() => onInsert('π'))}
          className={`${btnSci} sm:hidden`}
        >
          π
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('e'))}
          className={`${btnSci} hidden sm:flex`}
        >
          e
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('1'), 700)}
          className={btnNum}
        >
          1
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('2'), 700)}
          className={btnNum}
        >
          2
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('3'), 700)}
          className={btnNum}
        >
          3
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('+'))}
          className={btnOp}
        >
          +
        </button>

        {/* Row 7: 0, Decimal, EE, Negate, Equals */}
        <button
          onClick={() => handleKeyClick(() => onInsert('%'))}
          className={btnSci}
          title="Modulo"
        >
          mod
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('0'), 700)}
          className={btnNum}
        >
          0
        </button>
        <button
          onClick={() => handleKeyClick(() => onInsert('.'), 700)}
          className={btnNum}
        >
          .
        </button>
        <button
          onClick={() => handleKeyClick(onNegate, 650)}
          className={btnNum}
          title="Sign Negation (±)"
        >
          ±
        </button>
        <button
          onClick={handleCalcClick}
          className={`${btnBase} sm:col-span-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xl shadow-lg shadow-cyan-500/20 active:opacity-90`}
          title="Calculate result (=)"
        >
          =
        </button>
      </div>
    </div>
  );
};
