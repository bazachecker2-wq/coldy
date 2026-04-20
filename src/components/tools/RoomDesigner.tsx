import React, { useRef, useState, useEffect } from 'react';
import { Layers, Move, Plus, Trash2, Save, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomElement {
  id: string;
  type: 'ac' | 'vent' | 'window' | 'door';
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

export const RoomDesigner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<RoomElement[]>([
    { id: 'room-1', type: 'window', x: 100, y: 0, width: 80, height: 10, name: 'Окно 1' },
    { id: 'room-2', type: 'door', x: 400, y: 290, width: 60, height: 10, name: 'Вход' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Сетка
    ctx.strokeStyle = '#00d4ff08';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Стены комнаты
    ctx.strokeStyle = '#00d4ff33';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Элементы
    elements.forEach((el) => {
      const isSelected = el.id === selectedId;
      
      ctx.fillStyle = isSelected ? '#00d4ff22' : '#00d4ff0a';
      ctx.strokeStyle = isSelected ? '#00d4ff' : '#00d4ffaa';
      ctx.lineWidth = isSelected ? 2 : 1;

      if (el.type === 'ac') {
        ctx.setLineDash([5, 3]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.fillRect(el.x, el.y, el.width, el.height);
      ctx.strokeRect(el.x, el.y, el.width, el.height);

      // Имя элемента
      ctx.fillStyle = '#00d4ff';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText(el.name.toUpperCase(), el.x, el.y - 5);
      
      if (isSelected) {
        // Уголки выделения
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(el.x - 3, el.y - 3, 6, 6);
        ctx.fillRect(el.x + el.width - 3, el.y - 3, 6, 6);
        ctx.fillRect(el.x - 3, el.y + el.height - 3, 6, 6);
        ctx.fillRect(el.x + el.width - 3, el.y + el.height - 3, 6, 6);
      }
    });

    ctx.setLineDash([]);
  };

  useEffect(() => {
    draw();
  }, [elements, selectedId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = elements.slice().reverse().find(el => 
      x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height
    );

    if (clicked) {
      setSelectedId(clicked.id);
      setIsDragging(true);
      setDragOffset({ x: x - clicked.x, y: y - clicked.y });
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements(elements.map(el => 
      el.id === selectedId 
        ? { ...el, x: Math.round((x - dragOffset.x) / 10) * 10, y: Math.round((y - dragOffset.y) / 10) * 10 }
        : el
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addElement = (type: RoomElement['type']) => {
    const newEl: RoomElement = {
      id: `el-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'ac' ? 60 : 40,
      height: type === 'ac' ? 30 : 40,
      name: type === 'ac' ? 'Кондиционер' : 'Вент. решетка'
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 blueprint-card p-0 overflow-hidden bg-[#050b14] relative">
        <canvas 
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full bg-[#050b14] cursor-crosshair"
        />
        <div className="absolute bottom-4 left-4 flex gap-2">
            <button onClick={() => addElement('ac')} className="blueprint-button flex items-center gap-2 !py-1 text-[10px]">
                <Plus className="w-3 h-3" /> ДОБАВИТЬ БЛОК
            </button>
            <button onClick={() => addElement('vent')} className="blueprint-button flex items-center gap-2 !py-1 text-[10px]">
                <Layers className="w-3 h-3" /> ВЕНТИЛЯЦИЯ
            </button>
        </div>
        <div className="absolute top-4 right-4 text-[9px] font-mono text-[#00d4ff] opacity-40 uppercase tracking-widest text-right">
            MOD: ROOM_EDITOR v2.4<br/>
            STATUS: LAYER_ISOMETRIC
        </div>
      </div>

      <div className="space-y-6">
        <div className="blueprint-card">
          <h3 className="font-mono text-[10px] text-[#00d4ff] uppercase tracking-[3px] mb-4">Инспекция слоя</h3>
          {selectedId ? (
            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-[#00d4ff22] pb-2">
                  <span className="text-[9px] opacity-40 uppercase">ID Элемента</span>
                  <span className="text-[10px] text-[#00d4ff] font-mono">{selectedId}</span>
               </div>
               <div className="flex justify-between items-center border-b border-[#00d4ff22] pb-2">
                  <span className="text-[9px] opacity-40 uppercase">Тип модуля</span>
                  <span className="text-[10px] text-[#00d4ff] font-mono">{elements.find(e => e.id === selectedId)?.type.toUpperCase()}</span>
               </div>
               <button onClick={deleteSelected} className="w-full py-2 border border-red-500/40 text-red-500 font-mono text-[9px] uppercase hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-3 h-3 inline mr-2" /> УДАЛИТЬ ОБЪЕКТ
               </button>
            </div>
          ) : (
            <p className="text-[9px] font-mono opacity-30 text-center py-4">ВЫБЕРИТЕ ОБЪЕКТ ДЛЯ РЕДАКТИРОВАНИЯ</p>
          )}
        </div>

        <div className="blueprint-card space-y-4">
           <button className="solid-button w-full flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> СОХРАНИТЬ ПРОЕКТ
           </button>
           <button className="blueprint-button w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> ЭКСПОРТ ЧЕРТЕЖА
           </button>
        </div>
      </div>
    </div>
  );
};
