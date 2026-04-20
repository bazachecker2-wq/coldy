import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Ruler, Trash2, Save, Calculator } from "lucide-react";

export const PowerCalculator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const [area, setArea] = useState(0);

  const calculateArea = (pts: { x: number, y: number }[]) => {
    if (pts.length < 3) return 0;
    // shoelace formula
    let total = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      total += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
    }
    // pixel to meters conversion (approx 20px = 1m)
    return Math.abs(total / 2) / (20 * 20);
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = "rgba(0, 212, 255, 0.05)";
    ctx.lineWidth = 0.5;
    for(let i=0; i<canvas.width; i+=25) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=25) {
      ctx.beginPath();
      ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    if (points.length === 0) return;

    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    if (points.length > 2) ctx.closePath();
    ctx.stroke();

    // Draw nodes
    points.forEach(p => {
      ctx.fillStyle = "#00d4ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  useEffect(() => {
    redraw();
    setArea(calculateArea(points));
  }, [points]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([...points, { x, y }]);
  };

  const clear = () => {
    setPoints([]);
  };

  return (
    <div className="blueprint-card flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[#00d4ff33] pb-4">
        <div className="flex items-center gap-2">
          <Ruler className="text-[#00d4ff] w-5 h-5" />
          <h2 className="font-mono text-sm font-bold tracking-[3px] uppercase">Geometric_Calculator</h2>
        </div>
        <div className="flex gap-4 font-mono text-[10px] uppercase opacity-60">
          <div>Area: <span className="text-[#00d4ff] font-bold">{area.toFixed(1)} m²</span></div>
          <div>Load: <span className="text-[#00d4ff] font-bold">{(area * 0.1).toFixed(1)} kW</span></div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          onMouseDown={handleMouseDown}
          className="w-full bg-[#050b14] border border-[#00d4ff44] cursor-crosshair"
        />
        <div className="absolute top-2 left-2 pointer-events-none font-mono text-[9px] text-[#00d4ff] opacity-20 uppercase tracking-widest">
          SYSTEM_GRID: 25px = 1m
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-[9px] font-mono opacity-40 uppercase tracking-tight">
          * DEFINE_NODES_ON_GRID <br/>
          * CALCULATION_REF_ID: #8821
        </p>
        <div className="flex gap-2">
          <button onClick={clear} className="blueprint-button flex items-center gap-2 !border-red-500/40 !text-red-500 hover:!bg-red-500/10">
            <Trash2 className="w-3 h-3" /> PURGE_NODES
          </button>
          <button className="solid-button !py-1.5 !px-3">
            RECALCULATE
          </button>
        </div>
      </div>
    </div>
  );
};
