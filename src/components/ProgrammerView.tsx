import React, { useState } from 'react';
import { ProgrammerBase, BitWordSize } from '../types/calculator';
import { soundFx } from '../utils/audio';

export const ProgrammerView: React.FC = () => {
  const [currentBase, setCurrentBase] = useState<ProgrammerBase>('DEC');
  const [wordSize, setWordSize] = useState<BitWordSize>(64);
  const [isSigned, setIsSigned] = useState(false);

  // Stored as BigInt for full 64-bit precision
  const [currentValue, setCurrentValue] = useState<bigint>(0n);
  const [storedOp, setStoredOp] = useState<string | null>(null);
  const [storedValue, setStoredValue] = useState<bigint | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(true);

  // Mask value based on wordSize
  const getMask = (size: BitWordSize): bigint => {
    switch (size) {
      case 8: return 0xFFn;
      case 16: return 0xFFFFn;
      case 32: return 0xFFFFFFFFn;
      case 64:
      default:
        return 0xFFFFFFFFFFFFFFFFn;
    }
  };

  const mask = getMask(wordSize);
  const maskedVal = currentValue & mask;

  // Format representations
  const hexString = maskedVal.toString(16).toUpperCase();
  const decString = isSigned ? BigInt.asIntN(wordSize, maskedVal).toString(10) : maskedVal.toString(10);
  const octString = maskedVal.toString(8);
  const binRaw = maskedVal.toString(2).padStart(wordSize, '0');

  // Format binary into 4-bit nibbles
  const binChunks = [];
  for (let i = 0; i < binRaw.length; i += 4) {
    binChunks.push(binRaw.slice(i, i + 4));
  }

  // Handle number input
  const handleDigit = (digit: string) => {
    soundFx.playClick(720);
    const validChars: Record<ProgrammerBase, RegExp> = {
      HEX: /^[0-9A-Fa-f]$/,
      DEC: /^[0-9]$/,
      OCT: /^[0-7]$/,
      BIN: /^[0-1]$/,
    };

    if (!validChars[currentBase].test(digit)) return;

    if (isNewEntry) {
      const radix = currentBase === 'HEX' ? 16 : currentBase === 'DEC' ? 10 : currentBase === 'OCT' ? 8 : 2;
      setCurrentValue(BigInt(parseInt(digit, radix)) & mask);
      setIsNewEntry(false);
    } else {
      let currentStr = '';
      if (currentBase === 'HEX') currentStr = hexString;
      else if (currentBase === 'DEC') currentStr = decString;
      else if (currentBase === 'OCT') currentStr = octString;
      else currentStr = binRaw.replace(/^0+/, '') || '0';

      const nextStr = currentStr === '0' ? digit : currentStr + digit;
      try {
        const radix = currentBase === 'HEX' ? 16 : currentBase === 'DEC' ? 10 : currentBase === 'OCT' ? 8 : 2;
        // Parse with radix
        let nextBig = 0n;
        for (let i = 0; i < nextStr.length; i++) {
          const charCode = parseInt(nextStr[i], radix);
          nextBig = nextBig * BigInt(radix) + BigInt(charCode);
        }
        setCurrentValue(nextBig & mask);
      } catch {
        // Overflow or invalid
      }
    }
  };

  // Toggle individual bit
  const toggleBit = (bitIndex: number) => {
    soundFx.playClick(800);
    const bitMask = 1n << BigInt(bitIndex);
    setCurrentValue(prev => (prev ^ bitMask) & mask);
  };

  // Clear
  const handleClear = () => {
    soundFx.playClear();
    setCurrentValue(0n);
    setStoredOp(null);
    setStoredValue(null);
    setIsNewEntry(true);
  };

  // Backspace
  const handleBackspace = () => {
    soundFx.playClick(600);
    const radix = currentBase === 'HEX' ? 16 : currentBase === 'DEC' ? 10 : currentBase === 'OCT' ? 8 : 2;
    setCurrentValue(prev => (prev / BigInt(radix)) & mask);
  };

  // Operations: AND, OR, XOR, NOT, LSH, RSH, Neg
  const applyOp = (op: string) => {
    soundFx.playClick(780);
    if (op === 'NOT') {
      setCurrentValue(prev => (~prev) & mask);
      return;
    }
    if (op === 'NEG') {
      setCurrentValue(prev => (-prev) & mask);
      return;
    }
    if (op === 'LSH') {
      setCurrentValue(prev => (prev << 1n) & mask);
      return;
    }
    if (op === 'RSH') {
      setCurrentValue(prev => (prev >> 1n) & mask);
      return;
    }

    setStoredOp(op);
    setStoredValue(currentValue);
    setIsNewEntry(true);
  };

  const handleEquals = () => {
    soundFx.playEquals();
    if (storedOp && storedValue !== null) {
      let result = 0n;
      switch (storedOp) {
        case 'AND': result = storedValue & currentValue; break;
        case 'OR': result = storedValue | currentValue; break;
        case 'XOR': result = storedValue ^ currentValue; break;
        case 'NAND': result = ~(storedValue & currentValue); break;
        case 'NOR': result = ~(storedValue | currentValue); break;
        case '+': result = storedValue + currentValue; break;
        case '-': result = storedValue - currentValue; break;
        case '*': result = storedValue * currentValue; break;
        case '/':
          if (currentValue !== 0n) result = storedValue / currentValue;
          break;
        case '%':
          if (currentValue !== 0n) result = storedValue % currentValue;
          break;
      }
      setCurrentValue(result & mask);
      setStoredOp(null);
      setStoredValue(null);
      setIsNewEntry(true);
    }
  };

  // Character preview from low byte
  const asciiChar = Number(maskedVal & 0x7Fn);
  const asciiDisplay = asciiChar >= 32 && asciiChar <= 126 ? String.fromCharCode(asciiChar) : '·';

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Programmer Visor Display: 4 Bases simultaneously */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-4 shadow-xl space-y-2">
        {/* Word Size & Signed/Unsigned Controls */}
        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase">Size:</span>
            {([64, 32, 16, 8] as BitWordSize[]).map(size => (
              <button
                key={size}
                onClick={() => {
                  setWordSize(size);
                  setCurrentValue(v => v & getMask(size));
                }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  wordSize === size
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size === 64 ? 'QWORD' : size === 32 ? 'DWORD' : size === 16 ? 'WORD' : 'BYTE'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSigned(!isSigned)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                isSigned
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isSigned ? 'SIGNED' : 'UNSIGNED'}
            </button>
            <div className="text-[11px] text-slate-400 font-mono">
              ASCII: <span className="text-cyan-400 font-bold px-1 rounded bg-slate-800">'{asciiDisplay}'</span>
            </div>
          </div>
        </div>

        {/* 4 Radix Rows */}
        <div className="space-y-1 font-mono text-xs sm:text-sm">
          {/* HEX */}
          <div
            onClick={() => setCurrentBase('HEX')}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentBase === 'HEX'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs w-12 text-slate-500">HEX</div>
            <div className="font-semibold text-right tracking-widest break-all">
              {hexString || '0'}
            </div>
          </div>

          {/* DEC */}
          <div
            onClick={() => setCurrentBase('DEC')}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentBase === 'DEC'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs w-12 text-slate-500">DEC</div>
            <div className="font-semibold text-right tracking-normal break-all">
              {decString || '0'}
            </div>
          </div>

          {/* OCT */}
          <div
            onClick={() => setCurrentBase('OCT')}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentBase === 'OCT'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs w-12 text-slate-500">OCT</div>
            <div className="font-semibold text-right tracking-widest break-all">
              {octString || '0'}
            </div>
          </div>

          {/* BIN */}
          <div
            onClick={() => setCurrentBase('BIN')}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentBase === 'BIN'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs w-12 text-slate-500">BIN</div>
            <div className="font-semibold text-right tracking-wider break-all text-[11px] sm:text-xs">
              {binChunks.join(' ') || '0000'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 64-Bit Toggle Matrix */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 shadow-md space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Interactive Bitboard ({wordSize}-bit)</span>
          <span className="text-[10px] text-slate-500">Click bit to toggle</span>
        </div>

        {/* 64-bit bits arranged in groups of 8 */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 font-mono text-xs">
          {Array.from({ length: wordSize }).map((_, idx) => {
            const bitIndex = wordSize - 1 - idx;
            const isSet = ((maskedVal >> BigInt(bitIndex)) & 1n) === 1n;
            return (
              <button
                key={bitIndex}
                onClick={() => toggleBit(bitIndex)}
                className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
                  isSet
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
                title={`Bit ${bitIndex}: ${isSet ? '1' : '0'}`}
              >
                <span className="text-[10px] sm:text-xs">{isSet ? '1' : '0'}</span>
                <span className="text-[8px] opacity-60">{bitIndex}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Base-N Logical & Numeric Keypad */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {/* Logic Operations Column/Row */}
        <button
          onClick={() => applyOp('AND')}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold"
        >
          AND
        </button>
        <button
          onClick={() => applyOp('OR')}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold"
        >
          OR
        </button>
        <button
          onClick={() => applyOp('XOR')}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold"
        >
          XOR
        </button>
        <button
          onClick={() => applyOp('NOT')}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold"
        >
          NOT
        </button>
        <button
          onClick={() => applyOp('LSH')}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold"
          title="Left Shift (<< 1)"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => applyOp('RSH')}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold"
          title="Right Shift (>> 1)"
        >
          &gt;&gt;
        </button>

        {/* Row 2: Hex digits A-F */}
        {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map(hexDigit => {
          const disabled = currentBase !== 'HEX';
          return (
            <button
              key={hexDigit}
              disabled={disabled}
              onClick={() => handleDigit(hexDigit)}
              className={`p-2 sm:p-2.5 rounded-xl font-mono text-sm font-semibold transition-colors ${
                disabled
                  ? 'bg-slate-950/40 text-slate-700 border border-slate-900 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 active:scale-95'
              }`}
            >
              {hexDigit}
            </button>
          );
        })}

        {/* Numeric rows */}
        <button
          disabled={currentBase === 'BIN'}
          onClick={() => handleDigit('7')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          7
        </button>
        <button
          disabled={currentBase === 'BIN' || currentBase === 'OCT'}
          onClick={() => handleDigit('8')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          8
        </button>
        <button
          disabled={currentBase === 'BIN' || currentBase === 'OCT'}
          onClick={() => handleDigit('9')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          9
        </button>
        <button
          onClick={() => applyOp('/')}
          className="p-2.5 sm:p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 font-mono text-base font-semibold border border-cyan-800/40"
        >
          ÷
        </button>
        <button
          onClick={handleBackspace}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono text-xs font-semibold border border-slate-700"
        >
          DEL
        </button>
        <button
          onClick={handleClear}
          className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono text-xs font-semibold border border-rose-500/30"
        >
          AC
        </button>

        {/* 4, 5, 6, * */}
        <button
          disabled={currentBase === 'BIN'}
          onClick={() => handleDigit('4')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          4
        </button>
        <button
          disabled={currentBase === 'BIN'}
          onClick={() => handleDigit('5')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          5
        </button>
        <button
          disabled={currentBase === 'BIN'}
          onClick={() => handleDigit('6')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          6
        </button>
        <button
          onClick={() => applyOp('*')}
          className="p-2.5 sm:p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 font-mono text-base font-semibold border border-cyan-800/40"
        >
          ×
        </button>
        <button
          onClick={() => applyOp('NEG')}
          className="col-span-2 p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-slate-800"
          title="2's Complement Negation"
        >
          2's COMP
        </button>

        {/* 1, 2, 3, - */}
        <button
          onClick={() => handleDigit('1')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800"
        >
          1
        </button>
        <button
          disabled={currentBase === 'BIN'}
          onClick={() => handleDigit('2')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          2
        </button>
        <button
          disabled={currentBase === 'BIN'}
          onClick={() => handleDigit('3')}
          className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          3
        </button>
        <button
          onClick={() => applyOp('-')}
          className="p-2.5 sm:p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 font-mono text-base font-semibold border border-cyan-800/40"
        >
          −
        </button>
        <button
          onClick={() => applyOp('+')}
          className="col-span-2 p-2.5 sm:p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 font-mono text-base font-semibold border border-cyan-800/40"
        >
          +
        </button>

        {/* 0 and Equals */}
        <button
          onClick={() => handleDigit('0')}
          className="col-span-3 p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-semibold border border-slate-800"
        >
          0
        </button>
        <button
          onClick={handleEquals}
          className="col-span-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono text-xl font-bold shadow-md shadow-cyan-500/20"
        >
          =
        </button>
      </div>
    </div>
  );
};
