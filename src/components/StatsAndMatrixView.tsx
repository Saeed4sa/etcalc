import React, { useState } from 'react';
import { Copy, Check, Plus, RefreshCw } from 'lucide-react';

interface StatsAndMatrixViewProps {
  onInsertValue: (val: string) => void;
}

export const StatsAndMatrixView: React.FC<StatsAndMatrixViewProps> = ({ onInsertValue }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'matrix'>('stats');

  // Stats State
  const [dataInput, setDataInput] = useState<string>('12, 15, 18, 22, 25, 29, 31, 35, 42');

  // Matrix State
  const [matrixSize, setMatrixSize] = useState<2 | 3>(2);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [2, 3],
    [1, 4],
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [1, 2],
    [3, 1],
  ]);

  // Handle matrix size change
  const handleSizeChange = (newSize: 2 | 3) => {
    setMatrixSize(newSize);
    if (newSize === 2) {
      setMatrixA([
        [2, 3],
        [1, 4],
      ]);
      setMatrixB([
        [1, 2],
        [3, 1],
      ]);
    } else {
      setMatrixA([
        [1, 2, 3],
        [0, 1, 4],
        [5, 6, 0],
      ]);
      setMatrixB([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]);
    }
  };

  // Matrix cell update
  const updateCellA = (row: number, col: number, val: number) => {
    const copy = matrixA.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? val : c))
    );
    setMatrixA(copy);
  };

  // Compute 1-Var Stats
  const parseNumbers = (text: string): number[] => {
    return text
      .split(/[\s,;\n]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));
  };

  const nums = parseNumbers(dataInput).sort((a, b) => a - b);
  const n = nums.length;

  let mean = 0;
  let median = 0;
  let mode: number[] = [];
  let min = 0;
  let max = 0;
  let range = 0;
  let q1 = 0;
  let q3 = 0;
  let iqr = 0;
  let sum = 0;
  let sumSq = 0;
  let popVar = 0;
  let sampleVar = 0;
  let popStdDev = 0;
  let sampleStdDev = 0;

  if (n > 0) {
    min = nums[0];
    max = nums[n - 1];
    range = max - min;
    sum = nums.reduce((a, b) => a + b, 0);
    mean = sum / n;
    sumSq = nums.reduce((a, b) => a + b * b, 0);

    // Median
    if (n % 2 === 0) {
      median = (nums[n / 2 - 1] + nums[n / 2]) / 2;
    } else {
      median = nums[Math.floor(n / 2)];
    }

    // Quartiles
    const lowerHalf = nums.slice(0, Math.floor(n / 2));
    const upperHalf = n % 2 === 0 ? nums.slice(n / 2) : nums.slice(Math.floor(n / 2) + 1);

    if (lowerHalf.length > 0) {
      q1 = lowerHalf.length % 2 === 0
        ? (lowerHalf[lowerHalf.length / 2 - 1] + lowerHalf[lowerHalf.length / 2]) / 2
        : lowerHalf[Math.floor(lowerHalf.length / 2)];
    }
    if (upperHalf.length > 0) {
      q3 = upperHalf.length % 2 === 0
        ? (upperHalf[upperHalf.length / 2 - 1] + upperHalf[upperHalf.length / 2]) / 2
        : upperHalf[Math.floor(upperHalf.length / 2)];
    }
    iqr = q3 - q1;

    // Variance & StdDev
    popVar = nums.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / n;
    popStdDev = Math.sqrt(popVar);

    if (n > 1) {
      sampleVar = nums.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / (n - 1);
      sampleStdDev = Math.sqrt(sampleVar);
    }

    // Mode
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    for (const num of nums) {
      freq[num] = (freq[num] || 0) + 1;
      if (freq[num] > maxFreq) maxFreq = freq[num];
    }
    if (maxFreq > 1) {
      mode = Object.keys(freq)
        .filter(k => freq[Number(k)] === maxFreq)
        .map(Number);
    }
  }

  // Matrix Math
  const det2x2 = (m: number[][]) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
  const det3x3 = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

  const detA = matrixSize === 2 ? det2x2(matrixA) : det3x3(matrixA);
  const traceA = matrixSize === 2 ? matrixA[0][0] + matrixA[1][1] : matrixA[0][0] + matrixA[1][1] + matrixA[2][2];

  // Inverse 2x2
  let invA: number[][] | null = null;
  if (Math.abs(detA) > 1e-12) {
    if (matrixSize === 2) {
      invA = [
        [matrixA[1][1] / detA, -matrixA[0][1] / detA],
        [-matrixA[1][0] / detA, matrixA[0][0] / detA],
      ];
    }
  }

  // Matrix A * B
  const multAB: number[][] = [];
  for (let r = 0; r < matrixSize; r++) {
    const row = [];
    for (let c = 0; c < matrixSize; c++) {
      let cell = 0;
      for (let k = 0; k < matrixSize; k++) {
        cell += matrixA[r][k] * matrixB[k][c];
      }
      row.push(cell);
    }
    multAB.push(row);
  }

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          1-Variable Statistics
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'matrix'
              ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Matrix Engine
        </button>
      </div>

      {activeTab === 'stats' ? (
        /* Statistics View */
        <div className="space-y-4">
          {/* Dataset Input */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <label>Dataset (values separated by commas or spaces)</label>
              <span className="text-cyan-400">n = {n}</span>
            </div>
            <textarea
              rows={2}
              value={dataInput}
              onChange={e => setDataInput(e.target.value)}
              placeholder="e.g. 5, 8, 12, 14, 18, 22"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Stats Results Grid */}
          {n > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Mean (μ)', val: mean.toFixed(4), raw: mean },
                { label: 'Median', val: median.toFixed(4), raw: median },
                { label: 'Sample Std Dev (s)', val: sampleStdDev.toFixed(4), raw: sampleStdDev },
                { label: 'Population Std Dev (σ)', val: popStdDev.toFixed(4), raw: popStdDev },
                { label: 'Sample Variance (s²)', val: sampleVar.toFixed(4), raw: sampleVar },
                { label: 'Min / Max', val: `${min} / ${max}`, raw: min },
                { label: 'IQR (Q3 - Q1)', val: `${iqr.toFixed(2)} (${q1} .. ${q3})`, raw: iqr },
                { label: 'Sum (∑x)', val: sum.toFixed(4), raw: sum },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="text-[11px] font-mono text-slate-400">{stat.label}</div>
                  <div className="font-mono text-base font-semibold text-white my-1 break-all">
                    {stat.val}
                  </div>
                  <button
                    onClick={() => onInsertValue(stat.raw.toString())}
                    className="self-end text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Enter numeric values above to compute full statistical metrics.
            </div>
          )}
        </div>
      ) : (
        /* Matrix View */
        <div className="space-y-4">
          {/* Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Dimensions:</span>
            {[2, 3].map(size => (
              <button
                key={size}
                onClick={() => handleSizeChange(size as 2 | 3)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  matrixSize === size
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {size} × {size}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matrix A */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-cyan-400">Matrix A</span>
                <span className="text-slate-500">det(A) = {detA.toFixed(3)}</span>
              </div>

              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))`,
                }}
              >
                {matrixA.map((row, r) =>
                  row.map((val, c) => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      value={val}
                      onChange={e => updateCellA(r, c, parseFloat(e.target.value) || 0)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  ))
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Trace: {traceA}</span>
                <button
                  onClick={() => onInsertValue(detA.toString())}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Insert det(A)</span>
                </button>
              </div>
            </div>

            {/* Matrix Operations & Products */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-semibold text-cyan-400">
                Matrix Multiplication (A × B)
              </div>

              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))`,
                }}
              >
                {multAB.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`res-${r}-${c}`}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-center font-mono text-sm text-cyan-300"
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>

              {invA && matrixSize === 2 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">Inverse Matrix (A⁻¹):</div>
                  <div className="grid grid-cols-2 gap-2">
                    {invA.map((row, r) =>
                      row.map((v, c) => (
                        <div
                          key={`inv-${r}-${c}`}
                          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center font-mono text-xs text-purple-300"
                        >
                          {v.toFixed(3)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
