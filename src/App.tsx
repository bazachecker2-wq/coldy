import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, LayoutGrid, Terminal, Boxes, Settings2, Info, X, Check, Trash2 } from "lucide-react";
import { useAppStore } from "./store/useAppStore";
import { ProductCard3D } from "./components/catalog/ProductCard3D";
import { AIOverlay } from "./components/ai/AIOverlay";
import { PowerCalculator } from "./components/tools/PowerCalculator";
import { cn } from "./lib/utils";

import { auth, db } from "./lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ARView } from "./components/tools/ARView";
import { RoomDesigner } from "./components/tools/RoomDesigner";
import { Search, Camera as CameraIcon, Cpu, ChevronRight, ArrowLeft, Layers } from "lucide-react";

export default function App() {
  const { 
    products, 
    setProducts, 
    cart, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    isLoading, 
    setIsLoading,
    selectedProduct,
    setSelectedProduct,
    searchProducts,
    generatedModel,
    setGeneratedModel
  } = useAppStore();
  
  const [activeTab, setActiveTab] = React.useState<"catalog" | "calculator" | "room-designer">("catalog");
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState(false);

  // 3D Menu Navigation Logic
  const handle3DMenuClick = (partId: string) => {
    switch (partId) {
      case "catalog":
        document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case "calculator":
        setActiveTab("calculator");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case "diagnostic":
        setIsDiagnosticsOpen(true);
        break;
      default:
        break;
    }
  };
  const [user, setUser] = React.useState<User | null>(null);
  const [isOrdering, setIsOrdering] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAROpen, setIsAROpen] = React.useState(false);
  const [isGeneratingModel, setIsGeneratingModel] = React.useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    searchProducts("");
  }, []);

  const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Ошибка входа:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(searchQuery);
  };

  const generateAIModel = async () => {
    if (!selectedProduct) return;
    setIsGeneratingModel(true);
    try {
      const response = await fetch(`${window.location.origin}/api/ai/generate-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id, imageUrl: selectedProduct.image || "" })
      });
      const data = await response.json();
      
      // Имитируем процесс появления модели
      setTimeout(() => {
        setGeneratedModel(data.modelParams);
        setIsGeneratingModel(false);
      }, 2500);
    } catch (err) {
      console.error("AI Generation failed:", err);
      setIsGeneratingModel(false);
    }
  };

  const confirmOrder = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }

    setIsOrdering(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        items: cart,
        total,
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      setOrderSuccess(true);
      setTimeout(() => {
        clearCart();
        setOrderSuccess(false);
        setIsCheckoutOpen(false);
        setIsOrdering(false);
      }, 3000);
    } catch (error) {
      console.error("Ошибка оформления заказа:", error);
      setIsOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-white blueprint-grid pb-24 selection:bg-black selection:text-white relative overflow-hidden">
      <div className="scanline" />
      <div className="bg-noise fixed inset-0 z-0 pointer-events-none" />
      
      {isAROpen && <ARView onClose={() => setIsAROpen(false)} />}
      
      {/* Vertical Side Navigation */}
      <nav className="fixed top-0 left-0 h-full w-20 border-r border-black flex flex-col items-center py-12 gap-10 z-40 bg-white">
        <div className="w-12 h-12 border border-black flex items-center justify-center group cursor-pointer hover:bg-black transition-all">
          <div className="w-4 h-1 bg-black group-hover:bg-white" />
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-6 mt-12">
          {[
            { id: "catalog", icon: LayoutGrid },
            { id: "calculator", icon: Settings2 },
            { id: "room-designer", icon: Layers }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "p-3 border border-transparent transition-all duration-300 relative",
                activeTab === item.id ? "border-black bg-black text-white" : "text-black/30 hover:text-black"
              )}
            >
              <item.icon className="w-5 h-5" />
              {activeTab === item.id && (
                <div className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-[2px] h-4 bg-white" />
              )}
            </button>
          ))}
          
          <div className="w-8 h-[1px] bg-black/10 my-4" />
          
          <button 
            onClick={() => setIsAROpen(true)}
            className="p-3 text-black/30 hover:text-black transition-colors"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-12 rotate-[-90deg] whitespace-nowrap">
           <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-black/20">System_v1.0.4 // Vortex</span>
        </div>
      </nav>

      {/* Основная область контента */}
      <main className="md:pl-20 relative z-10">
        {/* Main Header */}
        <header className="h-24 border-b border-black px-10 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold tracking-[0.3em] uppercase font-display">
              VORTEX <span className="font-light">blueprint</span>
            </h1>
            <div className="flex items-center gap-3 font-mono text-[9px] text-black/40 uppercase tracking-widest">
               <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-black"></div> STATUS: NOMINAL</span>
               <span className="opacity-20">//</span>
               <span>REF: ISO-2944</span>
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 max-w-xs transition-all focus-within:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="QUERY_GEOMETRY..."
                  className="w-full bg-transparent border-b border-black/10 py-3 pl-12 pr-4 text-xs font-mono text-black focus:outline-none focus:border-black transition-all placeholder:text-black/10 uppercase"
                />
              </div>
            </form>

            <button className="flex items-center gap-6 group" onClick={() => setIsCheckoutOpen(true)}>
              <div className="text-right">
                <div className="font-mono text-[11px] font-bold tracking-tighter">{cart.length} UNITS</div>
                <div className="font-mono text-[8px] opacity-20 uppercase tracking-widest leading-none">Manifest_Active</div>
              </div>
              <div className="w-14 h-14 border border-black flex items-center justify-center relative group-hover:bg-black group-hover:text-white transition-all duration-300">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-black border border-white" />
                )}
              </div>
            </button>
          </div>
        </header>

        <section className="p-12 max-w-[1400px] mx-auto space-y-24">
          {activeTab === "catalog" ? (
            <>
              {/* Hero Blueprint Section */}
              <div className="grid lg:grid-cols-5 gap-16 items-start py-12 border-b border-black pb-24">
                <div className="lg:col-span-3 space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-black font-mono text-[10px] tracking-[0.4em] uppercase opacity-30">
                      <div className="w-8 h-[1px] bg-black"></div>
                      Visualization_Module_01
                    </div>
                    <h2 className="heading-blueprint">
                      CORE <br/> <span className="opacity-30">SYSTEM</span> <br/> ENGINE
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-12 max-w-2xl">
                    <p className="text-black/60 leading-relaxed text-sm font-light border-l border-black pl-8 lowercase">
                      technical architecture for thermal dynamics. 
                      optimized cooling structures derived from procedural geometry.
                    </p>
                    <div className="space-y-6">
                      <button className="btn-blueprint w-full" onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}>
                        Inventory_Catalog
                      </button>
                      <button className="btn-blueprint w-full bg-black text-white" onClick={() => setActiveTab("calculator")}>
                        Schema_Module
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 relative">
                   <div className="blueprint-card border-black p-0 h-[500px] bg-white group cursor-pointer">
                      <ProductCard3D 
                        onPartClick={handle3DMenuClick}
                        category="internal"
                        specs={products[0] ? { power: products[0].power, area: products[0].area } : undefined}
                      />
                      <div className="absolute top-8 left-8 p-3 border border-black bg-white group-hover:bg-black group-hover:text-white transition-all duration-500">
                         <div className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold">Interactive_View</div>
                      </div>
                   </div>
                   
                   <div className="absolute -bottom-8 -left-8 p-6 bg-white border border-black shadow-[15px_15px_0_0_rgba(0,0,0,1)] max-w-[200px]">
                      <div className="font-mono text-[9px] text-black/30 uppercase tracking-widest mb-2">Live_Diagnostics</div>
                      <div className="font-mono text-[11px] font-bold uppercase mb-4">ISO_Grid_Active</div>
                      <div className="flex gap-2">
                         {[1,2,3,4,5].map(i => (
                           <div key={i} className={`h-1 flex-1 bg-black ${i > 3 ? 'opacity-10' : 'opacity-100'}`} />
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Product Catalog Grid */}
              <div className="space-y-12 pt-12" id="inventory">
                <div className="flex justify-between items-end border-b border-black pb-8">
                   <div className="space-y-2">
                      <h3 className="font-display font-bold text-4xl uppercase tracking-tighter">Manifest</h3>
                      <p className="text-technical text-black/30">Registry: x9_thermal_units</p>
                   </div>
                   <div className="flex gap-12 font-mono text-[9px] text-black/30 uppercase tracking-[0.2em] mb-2">
                      <div className="flex flex-col items-end">
                         <span className="font-bold text-black">Count</span>
                         <span>{products.length} Units</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="font-bold text-black">Protocol</span>
                         <span>Secure_SSL_V3</span>
                      </div>
                   </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-1 gap-y-1 bg-black border border-black overflow-hidden">
                  {isLoading ? (
                    Array(8).fill(0).map((_, i) => (
                      <div key={i} className="bg-white h-[400px] animate-pulse" />
                    ))
                  ) : (
                    products.map((product) => (
                      <motion.div
                        key={product.id}
                        className="bg-white p-8 group cursor-pointer transition-all duration-300 relative overflow-hidden"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="absolute top-6 left-6 font-mono text-[8px] text-black/10 uppercase tracking-widest z-10 group-hover:text-white/20 transition-colors">
                           Ref: {product.id.slice(0, 8)}
                        </div>
                        
                        <div className="aspect-[4/3] mb-12 relative">
                          {product.image ? (
                             <img 
                               src={product.image} 
                               alt={product.name} 
                               referrerPolicy="no-referrer" 
                               className="w-full h-full object-contain img-technical scale-110 group-hover:scale-125 duration-700" 
                             />
                          ) : (
                             <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] opacity-10 uppercase text-center border border-dashed border-black">
                                NO_IMAGE
                             </div>
                          )}
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                          <div className="space-y-2">
                             <div className="text-technical text-black/30 group-hover:text-white/40 transition-colors">{product.category}</div>
                             <h4 className="font-display font-bold text-xl uppercase tracking-tighter leading-none group-hover:text-white transition-colors">{product.name}</h4>
                          </div>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-black group-hover:border-white transition-colors">
                             <div className="font-mono text-lg font-bold group-hover:text-white transition-colors">
                                {product.price.toLocaleString("ru-RU")}
                                <span className="text-[10px] ml-1 opacity-40 uppercase">rub</span>
                             </div>
                             <div className="p-2 border border-black group-hover:border-white transition-colors">
                                <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
                             </div>
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-0" />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : activeTab === "calculator" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16"
            >
              <div className="border-b border-black pb-12">
                 <h2 className="heading-blueprint">MODULE <br/> <span className="opacity-30">CALC</span></h2>
              </div>
              <PowerCalculator />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16"
            >
               <div className="flex justify-between items-end border-b border-black pb-12">
                  <h2 className="heading-blueprint">DESIGN <br/> <span className="opacity-30">SOMA</span></h2>
               </div>
               <RoomDesigner />
            </motion.div>
          )}
        </section>

        <footer className="h-20 border-t border-black bg-white flex items-center justify-between px-10 text-[9px] uppercase tracking-[0.4em] font-mono mt-32 text-black/20">
          <div className="flex items-center gap-12">
             <span>SYS_LOG: RENDERING_ACTIVE</span>
             <span className="hidden sm:inline">// FPS: 60_NOMINAL</span>
          </div>
          <div className="flex gap-12 hidden sm:flex">
            <span>REG_MANIFEST: x9_prod_beta</span>
            <span>(c) 2026 VORTEX_LABS</span>
          </div>
        </footer>
      </main>

      {/* Оверлей карточки товара (Детальный просмотр) */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center md:p-12 lg:p-24 overflow-hidden">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-white/20 backdrop-blur-xl pointer-events-auto"
               onClick={() => setSelectedProduct(null)}
             />
             <motion.div 
               initial={{ y: "100%", opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               exit={{ y: "100%", opacity: 0 }} 
               className="w-full h-full bg-white border border-black z-10 flex flex-col relative pointer-events-auto shadow-[40px_40px_0_0_rgba(0,0,0,1)]"
             >
                <div className="h-24 border-b border-black flex items-center px-12 justify-between shrink-0">
                   <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                        <X className="w-5 h-5" />
                      </div>
                      <span className="text-technical text-black font-bold">CLOSE_INSPECTION</span>
                   </button>
                   <div className="font-mono text-[9px] text-black/30 uppercase tracking-[0.4em]">
                      Document_ISO: {selectedProduct.id.slice(0, 12)}
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-16 grid lg:grid-cols-2 gap-24">
                   <div className="space-y-16">
                      <div className="space-y-6">
                         <div className="text-technical text-black/30 tracking-[0.6em]">{selectedProduct.category}</div>
                         <h2 className="text-7xl font-display font-bold leading-none uppercase tracking-tighter">
                            {selectedProduct.name}
                         </h2>
                      </div>

                      <div className="space-y-12">
                         <div className="space-y-4">
                            <h3 className="text-technical font-bold border-b border-black/10 pb-4">Engine_Description</h3>
                            <p className="text-black/70 leading-relaxed text-sm font-light lowercase selection:bg-black selection:text-white">
                               {selectedProduct.description}
                            </p>
                         </div>

                         <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                            {[
                              { label: "Power_Load", val: selectedProduct.power },
                              { label: "Geom_Area", val: selectedProduct.area },
                              { label: "Acu_Acoustics", val: selectedProduct.specs?.noise || "22 db" },
                              { label: "Eff_Energy", val: selectedProduct.specs?.class || "A+++" }
                            ].map((spec, i) => (
                              <div key={i} className="space-y-2 border-l border-black pl-8">
                                <div className="text-technical text-black/20">{spec.label}</div>
                                <div className="text-xl font-mono font-bold uppercase">{spec.val}</div>
                              </div>
                            ))}
                         </div>

                         <div className="pt-12 flex gap-6">
                            <button onClick={() => addToCart(selectedProduct)} className="btn-blueprint flex-1 bg-black text-white hover:bg-white hover:text-black">
                               ADD_TO_MANIFEST
                            </button>
                            <button 
                               onClick={generateAIModel}
                               disabled={isGeneratingModel}
                               className="btn-blueprint flex-1"
                            >
                               {isGeneratingModel ? "SCANNING..." : "ENGINE_AI_SIM"}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-12">
                      <div className="blueprint-card border-black h-[500px]">
                         <ProductCard3D 
                            color={generatedModel?.color} 
                            scale={generatedModel?.scale}
                            wireframe={generatedModel?.wireframe}
                            category={selectedProduct.category}
                            specs={{ power: selectedProduct.power, area: selectedProduct.area }}
                         />
                      </div>

                      <AnimatePresence>
                        {generatedModel && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 border border-black space-y-6"
                          >
                             <div className="flex items-center gap-4">
                                <Terminal className="w-4 h-4" />
                                <span className="text-technical font-bold">Extraction_Log</span>
                             </div>
                             <p className="font-mono text-[10px] text-black/60 uppercase leading-relaxed tracking-tighter">
                                {generatedModel.description}
                             </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Модальное окно диагностики */}
      <AnimatePresence>
        {isDiagnosticsOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-white/40 backdrop-blur-md pointer-events-auto"
              onClick={() => setIsDiagnosticsOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 30 }} 
              className="bg-white border border-black w-full max-w-2xl z-10 p-12 shadow-[40px_40px_0_0_rgba(0,0,0,1)] relative overflow-hidden pointer-events-auto"
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] blueprint-grid" />

              <div className="flex justify-between items-center mb-12 relative">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 border border-black flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-black animate-pulse" />
                   </div>
                   <div>
                      <h2 className="font-display font-bold text-black uppercase tracking-tighter text-2xl">SYSTEM_DIAGNOSTICS</h2>
                      <p className="font-mono text-[9px] text-black/30 uppercase tracking-[0.3em]">Protocol_Vortex_v9.4</p>
                   </div>
                </div>
                <button onClick={() => setIsDiagnosticsOpen(false)} className="w-12 h-12 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all">
                   <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-12 relative">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[9px] uppercase font-mono font-bold">
                          <span>CORE_KERNEL_STATUS</span>
                          <span className="text-black">ACTIVE [NOMINAL]</span>
                       </div>
                       <div className="h-1.5 bg-black/5 relative">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: "88%" }} 
                            className="absolute top-0 left-0 h-full bg-black"
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[9px] uppercase font-mono font-bold">
                          <span>THERMAL_EFFICIENCY</span>
                          <span className="text-black">94.2%</span>
                       </div>
                       <div className="h-1.5 bg-black/5 relative">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: "94%" }} 
                            className="absolute top-0 left-0 h-full bg-black"
                          />
                       </div>
                    </div>
                    <div className="p-8 border border-black font-mono text-[10px] space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-black"></div>
                          <span className="font-bold uppercase tracking-widest text-black">OBJECT_MANIFEST</span>
                       </div>
                       <p className="text-black/60 leading-relaxed uppercase tracking-tighter lowercase">
                          system operating within optimal parameters. low condensation trace detected in sector b-4. routine service cycle recommended in 420 hours.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-8 font-mono">
                    <div className="text-[10px] font-bold text-black uppercase border-b border-black pb-4">Event_Log_Buffer</div>
                    <div className="space-y-4">
                      {[
                        { t: "12:44", m: "ROTOR_BLADE_CALIBRATION_OK" },
                        { t: "12:40", m: "INVERTER_FIRMWARE_PUSH" },
                        { t: "11:15", m: "CLOUD_SYNC_VORTEX_SECURE" }
                      ].map((log, i) => (
                        <div key={i} className="flex gap-4 text-[9px] uppercase tracking-tighter">
                           <span className="text-black/30 font-bold">{log.t}</span>
                           <span className="text-black truncate">{log.m}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn-blueprint w-full bg-black text-white py-6">
                       GENERATE_TECHNICAL_REPORT
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsCheckoutOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white border border-black w-full max-w-lg z-10 p-12 shadow-[40px_40px_0_0_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-center mb-10 border-b border-black pb-6">
                <h2 className="font-display font-bold text-black uppercase tracking-tighter text-2xl">MANIFEST_ORDER</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all"><X className="w-5 h-5" /></button>
              </div>

              {orderSuccess ? (
                <div className="py-16 text-center space-y-8">
                  <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto bg-black text-white">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-display font-bold uppercase tracking-tighter text-xl">ORDER_CONFIRMED</h3>
                    <p className="text-black/40 font-mono text-[10px] uppercase tracking-widest px-8">Engineering crew will contact you for field assessment protocol.</p>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-16 text-center text-black/20 font-mono uppercase text-[10px] tracking-[0.5em]">
                  MANIFEST_EMPTY
                </div>
              ) : (
                <>
                  <div className="max-h-[300px] overflow-y-auto mb-10 space-y-6 pr-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start border-b border-black/5 pb-4">
                        <div className="space-y-1">
                          <div className="text-xs font-mono font-bold uppercase tracking-tighter">{item.name}</div>
                          <div className="text-[9px] text-black/30 uppercase tracking-widest font-mono">Count: {item.quantity} // {item.price.toLocaleString()} RUB</div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 border border-black/10 hover:border-black hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-black pt-8 space-y-8">
                    <div className="flex justify-between items-end">
                      <span className="font-mono text-[10px] text-black/30 font-bold uppercase tracking-[0.3em]">Gross_Amount</span>
                      <span className="font-display font-bold text-3xl tracking-tighter">{total.toLocaleString()} <span className="text-sm font-normal">RUB</span></span>
                    </div>

                    {!user ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 font-mono text-[9px] text-black/40 uppercase tracking-widest justify-center">
                           <Info className="w-3 h-3" />
                           Authorization_Required
                        </div>
                        <button 
                          onClick={loginWithGoogle}
                          className="btn-blueprint w-full bg-black text-white py-6"
                        >
                          GOOGLE_AUTHENTICATION
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 font-mono text-[9px] text-black/40 uppercase tracking-widest">
                           <div className="w-2 h-2 bg-black animate-pulse"></div>
                           Authenticated: {user.email}
                        </div>
                        <button 
                          onClick={confirmOrder}
                          disabled={isOrdering}
                          className="btn-blueprint w-full bg-black text-white py-6 disabled:opacity-20"
                        >
                          {isOrdering ? "PROCESSING_CORE..." : "SUBMIT_ENGINEERING_QUEUE"}
                        </button>
                      </div>
                    )}
                    
                    <p className="text-[8px] font-mono text-black/20 text-center uppercase tracking-widest leading-loose">
                      Submission implies consent to technical audit protocols and energy compliance verification.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIOverlay />
    </div>
  );
}
