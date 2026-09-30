import React, { useState, useEffect } from 'react';
import { X, FileCode, Download, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

interface SingleFileExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleFileExportModal: React.FC<SingleFileExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/calculator.html')
        .then(res => res.text())
        .then(text => {
          setHtmlContent(text);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aethercalc-scientific.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!htmlContent) return;
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white font-mono text-sm">
                Standalone Single-File HTML
              </h3>
              <p className="text-[11px] text-slate-400">Complete, portable, zero-dependency calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
          <p>
            The entire scientific calculator — including its <strong className="text-cyan-300">styling</strong>, <strong className="text-cyan-300">audio synthesizer</strong>, <strong className="text-cyan-300">graphing canvas</strong>, <strong className="text-cyan-300">Base-N programmer mode</strong>, and <strong className="text-cyan-300">unit converter</strong> — is packed into a single self-contained <code className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 font-mono text-[11px]">.html</code> file.
          </p>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero server required · Double-click to run on any computer or phone</span>
            </div>
            <div className="text-slate-400">
              File: <span className="text-slate-200">calculator.html</span> (~44 KB self-contained)
            </div>
          </div>
        </div>

        {/* Code snippet preview */}
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-[10px] text-slate-400 max-h-24 overflow-hidden relative">
          <div className="text-cyan-400/80">&lt;!DOCTYPE html&gt;</div>
          <div className="text-slate-500">&lt;html lang="en" class="dark"&gt;</div>
          <div className="text-slate-500">&nbsp;&nbsp;&lt;head&gt;... &lt;style&gt;/* Inlined styles &amp; dark obsidian theme */&lt;/style&gt;&lt;/head&gt;</div>
          <div className="text-slate-500">&nbsp;&nbsp;&lt;body&gt;... &lt;script&gt;/* Inlined math engine &amp; UI */&lt;/script&gt;&lt;/body&gt;</div>
          <div className="text-cyan-400/80">&lt;/html&gt;</div>
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy HTML Source</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <a
              href="/calculator.html"
              download="aethercalc-scientific.html"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .HTML File</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
