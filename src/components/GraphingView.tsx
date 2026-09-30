import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Table, Eye, EyeOff } from 'lucide-react';
import { evaluateExpression, numericalDerivative } from '../utils/mathEngine';
import { AngleUnit } from '../types/calculator';

interface GraphingViewProps {
  angleUnit: AngleUnit;
}

export const GraphingView: React.FC<GraphingViewProps> = ({ angleUnit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [func1, setFunc1] = useState('sin(x) * x');
  const [func2, setFunc2] = useState('cos(x)');
  const [showFunc2, setShowFunc2] = useState(false);

  // View bounds
  const [view, setView] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -6,
    yMax: 6,
  });

  // Mouse trace state
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);

  // Table modal toggle
  const [showTable, setShowTable] = useState(false);

  // Sample presets
  const presets = [
    { label: 'sin(x) · x', f1: 'sin(x) * x', f2: '' },
    { label: 'x³ − 3x', f1: 'x^3 - 3*x', f2: '' },
    { label: 'Bell Curve', f1: 'exp(-x^2)', f2: '' },
    { label: 'Harmonic', f1: 'sin(2*x)', f2: 'cos(3*x)' },
    { label: 'Rational', f1: '1 / (x^2 + 1)', f2: '' },
  ];

  // Render canvas
  const renderGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, width, height);

    // Helpers to convert math coords to screen coords
    const toScreenX = (x: number) => ((x - view.xMin) / (view.xMax - view.xMin)) * width;
    const toScreenY = (y: number) => height - ((y - view.yMin) / (view.yMax - view.yMin)) * height;
    const toMathX = (px: number) => view.xMin + (px / width) * (view.xMax - view.xMin);
    const toMathY = (py: number) => view.yMax - (py / height) * (view.yMax - view.yMin);

    // Grid lines
    const xSpan = view.xMax - view.xMin;
    const ySpan = view.yMax - view.yMin;

    const getStep = (span: number) => {
      const raw = span / 10;
      const mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const rel = raw / mag;
      if (rel < 2) return mag;
      if (rel < 5) return 2 * mag;
      return 5 * mag;
    };

    const xStep = getStep(xSpan);
    const yStep = getStep(ySpan);

    // Draw grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '10px JetBrains Mono, monospace';

    // Vertical grid lines
    const startX = Math.floor(view.xMin / xStep) * xStep;
    for (let x = startX; x <= view.xMax; x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-9) {
        const sy = Math.min(Math.max(toScreenY(0) + 14, 14), height - 4);
        ctx.fillText(Number(x.toFixed(2)).toString(), sx - 8, sy);
      }
    }

    // Horizontal grid lines
    const startY = Math.floor(view.yMin / yStep) * yStep;
    for (let y = startY; y <= view.yMax; y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (Math.abs(y) > 1e-9) {
        const sx = Math.min(Math.max(toScreenX(0) + 6, 6), width - 36);
        ctx.fillText(Number(y.toFixed(2)).toString(), sx, sy + 3);
      }
    }

    // Primary Axes (X and Y = 0)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';

    // X Axis
    const yZero = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, yZero);
    ctx.lineTo(width, yZero);
    ctx.stroke();

    // Y Axis
    const xZero = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, height);
    ctx.stroke();

    // Function 1 (Cyan)
    const drawCurve = (expr: string, strokeColor: string, glowColor: string) => {
      if (!expr.trim()) return;
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;

      let started = false;
      const stepPixels = 1.5;

      for (let px = 0; px <= width; px += stepPixels) {
        const mathX = toMathX(px);
        try {
          const mathY = evaluateExpression(expr, angleUnit, { x: mathX });
          if (isFinite(mathY) && !isNaN(mathY)) {
            const py = toScreenY(mathY);
            if (py >= -height * 2 && py <= height * 3) {
              if (!started) {
                ctx.moveTo(px, py);
                started = true;
              } else {
                ctx.lineTo(px, py);
              }
            } else {
              started = false;
            }
          } else {
            started = false;
          }
        } catch {
          started = false;
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    };

    // Draw f1
    drawCurve(func1, '#06b6d4', 'rgba(6, 182, 212, 0.5)');

    // Draw f2 if active
    if (showFunc2 && func2.trim()) {
      drawCurve(func2, '#a855f7', 'rgba(168, 85, 247, 0.5)');
    }

    // Trace under mouse
    if (mousePos) {
      const mathX = toMathX(mousePos.x);
      try {
        const mathY = evaluateExpression(func1, angleUnit, { x: mathX });
        if (isFinite(mathY)) {
          const sy = toScreenY(mathY);

          // Vertical guide
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mousePos.x, 0);
          ctx.lineTo(mousePos.x, height);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing point
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(mousePos.x, sy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Coordinate label box
          const label = `(x: ${mathX.toFixed(3)}, y: ${mathY.toFixed(3)})`;
          ctx.font = '11px JetBrains Mono, monospace';
          const textW = ctx.measureText(label).width;

          const boxX = Math.min(Math.max(mousePos.x + 10, 10), width - textW - 20);
          const boxY = Math.min(Math.max(sy - 15, 20), height - 20);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.fillRect(boxX - 4, boxY - 14, textW + 8, 20);
          ctx.strokeRect(boxX - 4, boxY - 14, textW + 8, 20);

          ctx.fillStyle = '#38bdf8';
          ctx.fillText(label, boxX, boxY);
        }
      } catch {
        // Ignore trace evaluation error
      }
    }
  }, [view, func1, func2, showFunc2, angleUnit, mousePos]);

  // Redraw when dependencies change
  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  // Resize canvas to match display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    renderGraph();
  }, [renderGraph]);

  // Zoom helpers
  const handleZoom = (factor: number) => {
    setView(v => {
      const xCenter = (v.xMin + v.xMax) / 2;
      const yCenter = (v.yMin + v.yMax) / 2;
      const xHalf = ((v.xMax - v.xMin) * factor) / 2;
      const yHalf = ((v.yMax - v.yMin) * factor) / 2;
      return {
        xMin: xCenter - xHalf,
        xMax: xCenter + xHalf,
        yMin: yCenter - yHalf,
        yMax: yCenter + yHalf,
      };
    });
  };

  const resetView = () => {
    setView({ xMin: -10, xMax: 10, yMin: -6, yMax: 6 });
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX,
      mouseY,
      xMin: view.xMin,
      xMax: view.xMax,
      yMin: view.yMin,
      yMax: view.yMax,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    setMousePos({ x: mouseX, y: mouseY });

    if (isDragging && dragStartRef.current) {
      const dxPx = (e.clientX - rect.left) - dragStartRef.current.mouseX;
      const dyPx = (e.clientY - rect.top) - dragStartRef.current.mouseY;

      const xSpan = dragStartRef.current.xMax - dragStartRef.current.xMin;
      const ySpan = dragStartRef.current.yMax - dragStartRef.current.yMin;

      const dxMath = (dxPx / rect.width) * xSpan;
      const dyMath = (dyPx / rect.height) * ySpan;

      setView({
        xMin: dragStartRef.current.xMin - dxMath,
        xMax: dragStartRef.current.xMax - dxMath,
        yMin: dragStartRef.current.yMin + dyMath,
        yMax: dragStartRef.current.yMax + dyMath,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Generate table values
  const tableValues = [];
  if (showTable) {
    const step = 1;
    for (let x = -5; x <= 5; x += step) {
      let y1 = 'Error';
      let y2 = 'Error';
      try {
        const val = evaluateExpression(func1, angleUnit, { x });
        y1 = isFinite(val) ? val.toFixed(4) : 'Undefined';
      } catch {}
      if (showFunc2 && func2.trim()) {
        try {
          const val = evaluateExpression(func2, angleUnit, { x });
          y2 = isFinite(val) ? val.toFixed(4) : 'Undefined';
        } catch {}
      }
      tableValues.push({ x, y1, y2 });
    }
  }

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Function Inputs & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex-1 flex flex-col gap-2">
          {/* f(x) */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 w-12">f(x) =</span>
            <input
              type="text"
              value={func1}
              onChange={e => setFunc1(e.target.value)}
              placeholder="e.g. sin(x) * x"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* g(x) */}
          {showFunc2 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-purple-400 w-12">g(x) =</span>
              <input
                type="text"
                value={func2}
                onChange={e => setFunc2(e.target.value)}
                placeholder="e.g. cos(x)"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
          <button
            onClick={() => setShowFunc2(!showFunc2)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showFunc2
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showFunc2 ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>+g(x)</span>
          </button>

          <button
            onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showTable
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>

          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Curves Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        <span className="text-[11px] text-slate-500 font-mono pr-1">Presets:</span>
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => {
              setFunc1(p.f1);
              if (p.f2) {
                setFunc2(p.f2);
                setShowFunc2(true);
              } else {
                setShowFunc2(false);
              }
            }}
            className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 whitespace-nowrap text-xs font-mono transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl bg-[#070a12]">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setMousePos(null);
          }}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* View bounds badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 border border-slate-800/80 text-[10px] font-mono text-slate-400 backdrop-blur-xs">
          X: [{view.xMin.toFixed(1)}, {view.xMax.toFixed(1)}] · Y: [{view.yMin.toFixed(1)}, {view.yMax.toFixed(1)}]
        </div>

        {/* Table values drawer / overlay */}
        {showTable && (
          <div className="absolute top-0 right-0 bottom-0 w-64 bg-slate-900/95 border-l border-slate-800 p-3 overflow-y-auto backdrop-blur-md shadow-xl animate-in slide-in-from-right duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-mono font-semibold text-white">Table of Values</span>
              <button
                onClick={() => setShowTable(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/60 pb-1">
                  <th className="py-1">x</th>
                  <th className="py-1 text-cyan-400">f(x)</th>
                  {showFunc2 && <th className="py-1 text-purple-400">g(x)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {tableValues.map(row => (
                  <tr key={row.x}>
                    <td className="py-1 font-semibold text-slate-400">{row.x}</td>
                    <td className="py-1 text-cyan-300">{row.y1}</td>
                    {showFunc2 && <td className="py-1 text-purple-300">{row.y2}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
