import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Cpu, Terminal } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { askGemini } from "../../services/geminiService";

export const AIOverlay: React.FC = () => {
  const { messages, addMessage, isAgentOpen, toggleAgent } = useAppStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    addMessage(userMessage);
    setInput("");
    setIsTyping(true);

    const response = await askGemini(messages, input);
    addMessage({ role: "model" as const, text: response || "Ошибка связи." });
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isAgentOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 h-[450px] bg-[#050b14] border border-[#00d4ffaa] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col mb-4 overflow-hidden"
          >
            <div className="p-3 bg-[#00d4ff] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-black animate-pulse"></div>
                <span className="text-black font-bold text-[10px] tracking-widest uppercase">AI_ENGINE v2.4</span>
              </div>
              <button 
                onClick={toggleAgent}
                className="text-black text-[10px] cursor-pointer font-bold hover:opacity-70 transition-opacity"
              >
                [ _ ]
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px] scrollbar-hide bg-[#050b14]"
            >
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "text-right" : "flex gap-2 items-start"}>
                  {msg.role === "model" && <div className="w-4 h-4 bg-[#00d4ff] mt-1 shrink-0"></div>}
                  <div className={`p-2 inline-block ${
                    msg.role === "user" 
                      ? "bg-[#ffffff11] opacity-80 text-white" 
                      : "bg-[#00d4ff0a] border-l border-[#00d4ff] text-white"
                  }`}>
                    {msg.role === "model" && <span className="text-[#00d4ff] font-bold block mb-1 uppercase">AI_CONSULTANT:</span>}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-start">
                  <div className="w-4 h-4 bg-[#00d4ff] mt-1 animate-pulse"></div>
                  <div className="bg-[#00d4ff0a] p-2 border-l border-[#00d4ff] text-[#00d4ff] animate-pulse">
                    ANALYZING_SYSTEM_DATA...
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#00d4ff33]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="CMD_PROMPT..."
                  className="w-full bg-transparent border border-[#00d4ff33] px-3 py-2 text-[10px] focus:outline-none focus:border-[#00d4ff] text-white"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-3 w-2 h-2 bg-[#00d4ff] shadow-[0_0_5px_#00d4ff] hover:scale-125 transition-transform"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleAgent}
        className="w-14 h-14 bg-[#050b14] border border-[#00d4ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)] relative group"
      >
        <div className="w-6 h-6 bg-[#00d4ff] flex items-center justify-center">
           <MessageSquare className="w-4 h-4 text-black" />
        </div>
        <span className="absolute -top-10 right-0 bg-[#050b14] border border-[#00d4ff] text-[#00d4ff] text-[9px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono uppercase tracking-widest">
          Connect_AI
        </span>
      </motion.button>
    </div>
  );
};
