import React, { useState } from 'react';
import { X, Trash2, Download, Copy, Check, CornerDownLeft, Clock } from 'lucide-react';
import { HistoryItem } from '../types/calculator';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRecallExpression: (expr: string) => void;
  onUseResult: (res: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onRecallExpression,
  onUseResult,
  onClearHistory,
  onDeleteItem,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const rows = [
      ['Timestamp', 'Date', 'Expression', 'Result', 'AngleUnit'],
      ...history.map(item => [
        item.timestamp,
        new Date(item.timestamp).toISOString(),
        `"${item.expression.replace(/"/g, '""')}"`,
        `"${item.result.replace(/"/g, '""')}"`,
        item.angleUnit,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aethercalc_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="font-mono text-sm font-semibold text-white tracking-wide">
              Calculation History
            </h2>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={exportCSV}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClearHistory}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
                  title="Clear All History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 font-mono text-xs">
              <Clock className="w-8 h-8 stroke-[1.5] text-slate-600 mb-2 opacity-50" />
              <span>No calculations recorded yet.</span>
              <span className="text-[11px] text-slate-600 mt-1">
                Your evaluated calculations will be saved here automatically.
              </span>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className="group p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 transition-all space-y-1.5 select-text"
              >
                {/* Timestamp & Tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 select-none">
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-500/80">{item.angleUnit}</span>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity p-0.5"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Expression */}
                <div
                  onClick={() => onRecallExpression(item.expression)}
                  className="font-mono text-xs text-slate-400 hover:text-cyan-300 cursor-pointer break-all transition-colors"
                  title="Click to recall expression"
                >
                  {item.expression}
                </div>

                {/* Result & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div className="font-mono text-base font-semibold text-white break-all">
                    = {item.result}
                  </div>

                  <div className="flex items-center gap-1 select-none">
                    <button
                      onClick={() => handleCopy(item.result, item.id)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                      title="Copy result"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onUseResult(item.result)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/40 transition-colors flex items-center gap-1"
                      title="Use this result in calculator"
                    >
                      <CornerDownLeft className="w-3 h-3" />
                      <span>Ans</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 text-center select-none">
          Saved offline in browser storage · Persists across sessions
        </div>
      </div>
    </div>
  );
};
