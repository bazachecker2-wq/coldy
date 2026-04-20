import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, X, Box, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ARView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Доступ к камере отклонен или не поддерживается.");
      }
    };
    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
      {error ? (
        <div className="text-center p-8 space-y-4">
           <Camera className="w-16 h-16 text-red-500 mx-auto" />
           <p className="text-[#00d4ff] font-mono uppercase tracking-[2px]">{error}</p>
           <button onClick={onClose} className="blueprint-button">ЗАКРЫТЬ</button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          
          {/* AR Overlay Grid */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] border border-[#00d4ff44] rounded-lg">
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20">
                   {Array(16).fill(0).map((_, i) => (
                     <div key={i} className="border border-[#00d4ff22]"></div>
                   ))}
                </div>
                {/* Corners */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00d4ff]"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00d4ff]"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00d4ff]"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00d4ff]"></div>
             </div>
          </div>

          {/* AR Simulated Model Tag */}
          <AnimatePresence>
            {isPlaced && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: scale,
                  rotateY: rotation 
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-move"
                style={{ perspective: 1000 }}
                drag
                onPan={(e, info) => {
                  // Rotate based on horizontal movement
                  setRotation(prev => prev + info.delta.x * 0.5);
                  // Scale based on vertical movement (simulating pinch/zoom with Y axis)
                  setScale(prev => Math.max(0.5, Math.min(3, prev - info.delta.y * 0.01)));
                }}
              >
                 <div className="relative pointer-events-none">
                    <div className="w-48 h-24 bg-[#050b14aa] border border-[#00d4ff] backdrop-blur-md flex items-center justify-center p-4">
                       <Box className="w-12 h-12 text-[#00d4ff] animate-pulse" />
                       <div className="ml-4 space-y-1">
                          <div className="text-[10px] text-[#00d4ff] font-bold font-mono">X9_VIRTUAL_UNIT</div>
                          <div className="text-[8px] text-white opacity-60 uppercase font-mono tracking-widest">TOUCH_MODAL_ACTIVE</div>
                       </div>
                    </div>
                    
                    {/* Gesture Help Text */}
                    <div className="absolute -top-10 left-0 w-full text-center">
                       <div className="text-[8px] font-mono text-[#00d4ff] animate-pulse uppercase tracking-[1px]">
                          Жесты: Тяните (X) — Вращение / (Y) — Масштабирование
                       </div>
                    </div>

                    {/* Perspective lines */}
                    <div className="absolute -bottom-10 left-1/2 w-1 h-10 bg-gradient-to-t from-[#00d4ff] to-transparent"></div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute top-8 left-8 flex flex-col gap-2">
             <div className="font-mono text-[10px] text-[#00d4ff] font-bold uppercase tracking-[4px]">AR_SCANNER Mode</div>
             <div className="font-mono text-[8px] text-white opacity-40 uppercase">Sensors: Active // Latency: 12ms</div>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
             <X className="text-white" />
          </button>

          <div className="absolute bottom-12 left-0 w-full px-8 flex justify-between items-center">
             <div className="flex gap-4">
                <button 
                   onClick={() => {
                      setRotation(0);
                      setScale(1);
                   }}
                   className="w-14 h-14 bg-white/5 border border-white/20 flex items-center justify-center rounded-full hover:bg-[#00d4ff22] transition-colors"
                   title="Сброс положения"
                >
                   <RefreshCw className="text-white w-6 h-6" />
                </button>
             </div>

             <button 
                onClick={() => setIsPlaced(!isPlaced)}
                className="w-20 h-20 rounded-full border-4 border-white/40 flex items-center justify-center group"
             >
                <div className={`w-14 h-14 rounded-full transition-all duration-300 ${isPlaced ? 'bg-red-500 scale-90' : 'bg-[#00d4ff] group-hover:scale-110'}`}></div>
             </button>

             <div className="flex gap-4">
                <button className="w-14 h-14 bg-white/5 border border-white/20 flex items-center justify-center rounded-full">
                   <Maximize2 className="text-white w-6 h-6" />
                </button>
             </div>
          </div>

          {!isPlaced && (
            <div className="absolute bottom-36 left-1/2 -translate-x-1/2 text-white font-mono text-[10px] uppercase tracking-widest bg-black/40 px-4 py-2 backdrop-blur-sm">
                Наведите камеру на стену и нажмите кнопку
            </div>
          )}
        </>
      )}
    </div>
  );
};
