import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors shadow-sm"
        title="Install AetherCalc as standalone app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
          title="Install on iOS Home Screen"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Add to iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-slate-800 border border-slate-700 text-cyan-400 mt-0.5">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 1:</span> Tap the <strong className="text-cyan-300">Share</strong> icon in the bottom Safari toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-slate-800 border border-slate-700 text-cyan-400 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 2:</span> Scroll down and select <strong className="text-cyan-300">Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300/90 mt-2">
                  ✓ Functions 100% offline with instant load times and native app windowing.
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-cyan-500 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers without beforeinstallprompt or desktop
  return (
    <button
      onClick={() => {
        alert("To install AetherCalc: On Chrome/Edge, click the install icon in the address bar (or menu -> 'Install AetherCalc'). On mobile, choose 'Add to Home screen'.");
      }}
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900/60 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors"
      title="Install App Information"
    >
      <Download className="w-3.5 h-3.5 text-cyan-400" />
      <span>Install PWA</span>
    </button>
  );
};
