import React, { useState } from 'react';
import { Search, ArrowRightLeft, Copy, Check, Plus, Bookmark } from 'lucide-react';
import { SCIENTIFIC_CONSTANTS, UNIT_CATEGORIES } from '../utils/constants';
import { ScientificConstant } from '../types/calculator';

interface UnitsAndConstantsViewProps {
  onInsertValue: (value: string) => void;
}

export const UnitsAndConstantsView: React.FC<UnitsAndConstantsViewProps> = ({ onInsertValue }) => {
  const [activeTab, setActiveTab] = useState<'units' | 'constants'>('units');

  // Units state
  const [selectedCategory, setSelectedCategory] = useState(UNIT_CATEGORIES[0].id);
  const currentCat = UNIT_CATEGORIES.find(c => c.id === selectedCategory) || UNIT_CATEGORIES[0];
  const [fromUnitId, setFromUnitId] = useState(currentCat.units[0].id);
  const [toUnitId, setToUnitId] = useState(currentCat.units[1] ? currentCat.units[1].id : currentCat.units[0].id);
  const [inputValue, setInputValue] = useState<string>('1');

  // Constants state
  const [searchQuery, setSearchQuery] = useState('');
  const [constantCategory, setConstantCategory] = useState<string>('All');
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  // Conversion logic
  const fromUnit = currentCat.units.find(u => u.id === fromUnitId) || currentCat.units[0];
  const toUnit = currentCat.units.find(u => u.id === toUnitId) || currentCat.units[0];

  const numericInput = parseFloat(inputValue);
  let convertedValue = 0;
  if (!isNaN(numericInput)) {
    const baseValue = fromUnit.toBase(numericInput);
    convertedValue = toUnit.fromBase(baseValue);
  }

  const swapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSymbol(id);
    setTimeout(() => setCopiedSymbol(null), 1800);
  };

  // Filter constants
  const filteredConstants = SCIENTIFIC_CONSTANTS.filter(c => {
    const matchesCat = constantCategory === 'All' || c.category === constantCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q) ||
      c.unit.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* Top Segmented Tabs: Converter vs Constants */}
      <div className="flex items-center justify-between p-1 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'units'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unit Converter
          </button>
          <button
            onClick={() => setActiveTab('constants')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'constants'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scientific Constants
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 pr-3 hidden sm:block">
          Offline Knowledge Base
        </div>
      </div>

      {activeTab === 'units' ? (
        /* Unit Converter */
        <div className="space-y-4">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {UNIT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setFromUnitId(cat.units[0].id);
                  setToUnitId(cat.units[1] ? cat.units[1].id : cat.units[0].id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Interactive Conversion Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
            {/* From Box */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">From</label>
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xl text-white focus:outline-none focus:border-cyan-500"
              />
              <select
                value={fromUnitId}
                onChange={e => setFromUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {currentCat.units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* To Box */}
            <div className="space-y-2 relative">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">To</label>
                <button
                  onClick={swapUnits}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              </div>

              <div className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xl text-cyan-300 overflow-x-auto break-all">
                {!isNaN(numericInput) ? convertedValue.toLocaleString('en-US', { maximumFractionDigits: 8 }) : '0'}
              </div>

              <select
                value={toUnitId}
                onChange={e => setToUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {currentCat.units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Bottom Action Bar */}
            <div className="md:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="text-slate-400 font-mono text-xs">
                1 {fromUnit.symbol} = {(toUnit.fromBase(fromUnit.toBase(1))).toLocaleString('en-US', { maximumFractionDigits: 6 })} {toUnit.symbol}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(convertedValue.toString(), 'unit-result')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {copiedSymbol === 'unit-result' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => onInsertValue(convertedValue.toString())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert into Calc</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Scientific Constants */
        <div className="space-y-3">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search constants (e.g. Planck, c, gravity, pi)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {['All', 'Universal', 'Physics', 'Chemistry', 'Astronomy', 'Mathematics'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setConstantCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                    constantCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Constants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredConstants.map(c => (
              <div
                key={c.symbol}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-2">
                        <span className="font-mono text-cyan-400 text-base">{c.symbol}</span>
                        <span>{c.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{c.description}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {c.category}
                    </span>
                  </div>

                  <div className="mt-2 p-2 rounded-lg bg-slate-950 font-mono text-xs flex items-center justify-between text-slate-200">
                    <span className="font-semibold text-cyan-300">{c.formatted}</span>
                    <span className="text-slate-500 text-[11px]">{c.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60 text-xs">
                  <button
                    onClick={() => handleCopy(c.value.toString(), c.symbol)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                  >
                    {copiedSymbol === c.symbol ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => onInsertValue(c.value.toString())}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors text-[11px] font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert into Calc</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
