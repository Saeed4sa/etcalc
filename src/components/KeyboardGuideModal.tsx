import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardGuideModal: React.FC<KeyboardGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 - 9', action: 'Input numbers' },
    { key: '+ - * /', action: 'Basic arithmetic operators' },
    { key: 'Enter / =', action: 'Evaluate expression' },
    { key: 'Backspace', action: 'Delete last character' },
    { key: 'Escape / c', action: 'Clear all (AC)' },
    { key: '( and )', action: 'Parentheses' },
    { key: '^', action: 'Power exponent (xʸ)' },
    { key: 's / c / t', action: 'sin, cos, tan functions' },
    { key: 'p', action: 'π (Pi constant)' },
    { key: 'e', action: 'Euler constant / exp' },
    { key: 'l', action: 'Natural log (ln)' },
    { key: 'r', action: 'Square root (sqrt)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white font-mono text-sm">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {shortcuts.map(s => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
            >
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700 text-[11px]">
                {s.key}
              </kbd>
              <span className="text-slate-400 text-[11px] text-right font-sans">
                {s.action}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
