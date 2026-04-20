import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Grid, Float, useGLTF, Text as ThreeText, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface UnitModelProps {
  color?: string;
  wireframe?: boolean;
  scale?: [number, number, number];
  modelUrl?: string;
  onPartClick?: (partId: string) => void;
  category?: string;
}

const UnitModel: React.FC<UnitModelProps> = ({ 
  color = "#00d4ff", 
  wireframe = true, 
  scale = [1, 1, 1],
  modelUrl,
  onPartClick,
  category = "internal"
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [loadError, setLoadError] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  
  // Попытка загрузки внешней модели
  let sceneResult = null;
  try {
    if (modelUrl && !loadError) {
      const { scene } = useGLTF(modelUrl);
      sceneResult = scene;
    }
  } catch (e) {
    if (!loadError) {
      console.error("3D Model loading failed:", e);
      setLoadError(true);
    }
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  if (sceneResult && !loadError) {
    return <primitive object={sceneResult} ref={meshRef} scale={scale} onClick={() => onPartClick?.("main")} />;
  }

  const isExternal = category.toLowerCase().includes("внешний") || category.toLowerCase().includes("external");
  const isIndustrial = category.toLowerCase().includes("проф") || category.toLowerCase().includes("industrial");

  return (
    <group ref={meshRef} scale={scale}>
      {/* Outer Case - High-end Glass Shell / Transmission Material */}
      <mesh 
        position={[0, 0, 0]} 
        onPointerOver={() => setHovered("case")} 
        onPointerOut={() => setHovered(null)}
        onClick={(e) => { e.stopPropagation(); onPartClick?.("catalog"); }}
      >
        <boxGeometry args={isIndustrial ? [2.5, 1.8, 1.2] : isExternal ? [2, 1.2, 0.8] : [2, 0.6, 0.4]} />
        <MeshTransmissionMaterial 
          backside
          samples={16}
          thickness={0.2}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          temporalDistortion={0.1}
          clearcoat={1}
          color={hovered === "case" ? "#00ffff" : color}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Interior core base */}
      <group>
        <mesh 
          position={[0, 0, 0]} 
          onPointerOver={() => setHovered("core")} 
          onPointerOut={() => setHovered(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.("calculator"); }}
        >
          <boxGeometry args={isIndustrial ? [2.3, 1.6, 1] : isExternal ? [1.8, 1, 0.6] : [1.8, 0.4, 0.2]} />
          <meshStandardMaterial 
            color={hovered === "core" ? "#ffffff" : color} 
            wireframe={wireframe} 
            emissive={color} 
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Dynamic Components based on Type */}
        {isExternal && (
          <group position={[-0.4, 0, 0.35]}>
            <group 
              onPointerOver={() => setHovered("fan")} 
              onPointerOut={() => setHovered(null)}
              onClick={(e) => { e.stopPropagation(); onPartClick?.("diagnostic"); }}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.05, 24]} />
                <meshStandardMaterial color={hovered === "fan" ? "#ffffff" : color} metalness={1} roughness={0.1} emissive={color} emissiveIntensity={1} />
              </mesh>
              <mesh rotation={[0, 0, 0]}>
                <boxGeometry args={[0.05, 0.7, 0.01]} />
                <meshStandardMaterial color={hovered === "fan" ? "#ffffff" : color} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.05, 0.7, 0.01]} />
                <meshStandardMaterial color={hovered === "fan" ? "#ffffff" : color} />
              </mesh>
            </group>
          </group>
        )}

        {isIndustrial && (
          <group>
            <group position={[-0.6, 0.4, 0.55]}>
               <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
                  <meshStandardMaterial color={color} metalness={1} />
               </mesh>
            </group>
            <group position={[0.6, -0.4, 0.55]}>
               <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
                  <meshStandardMaterial color={color} metalness={1} />
               </mesh>
            </group>
            <mesh position={[0, -0.7, -0.4]} rotation={[0, 0, Math.PI / 2]}>
               <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
               <meshStandardMaterial color="#888" metalness={1} />
            </mesh>
          </group>
        )}

        {!isExternal && !isIndustrial && (
          <group>
            {Array.from({ length: 12 }).map((_, i) => (
              <mesh key={i} position={[0, 0, 0.1 + (i * 0.01)]}>
                <boxGeometry args={[1.6, 0.02, 0.005]} />
                <meshStandardMaterial color={color} opacity={0.5} transparent />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* Decorative Emissive Lights */}
      <mesh position={[0.8, isIndustrial ? 0.8 : 0.4, 0.4]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.75, isIndustrial ? 0.8 : 0.4, 0.4]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>

      {/* Labels for interactive parts */}
      <Suspense fallback={null}>
        <ThreeText
          position={[0, isIndustrial ? 1.4 : 0.8, 0]}
          fontSize={0.12}
          color="#00d4ff"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v13/t6nu27PSqW_48XwU668_Yl3SOfI.woff"
          anchorX="center"
          anchorY="middle"
        >
          [ СИСТЕМА_ИНДИКАЦИИ ]
        </ThreeText>
        {hovered === "case" && (
           <ThreeText position={[0, isIndustrial ? 1.6 : 1.1, 0.5]} fontSize={0.1} color="white">ОТКРЫТЬ_КАТАЛОГ</ThreeText>
        )}
        {hovered === "core" && (
           <ThreeText position={[0, isIndustrial ? 1.6 : 1.1, 0.5]} fontSize={0.1} color="white">МОДУЛЬ_РАСЧЕТОВ</ThreeText>
        )}
        {hovered === "fan" && (
           <ThreeText position={[-0.5, isIndustrial ? 1.6 : 1.1, 0.5]} fontSize={0.1} color="white">ИИ_ДИАГНОСТИКА</ThreeText>
        )}
      </Suspense>
    </group>
  );
};

interface ProductCard3DProps {
  color?: string;
  scale?: [number, number, number];
  wireframe?: boolean;
  modelUrl?: string;
  onPartClick?: (partId: string) => void;
  category?: string;
  specs?: {
    power?: string;
    area?: string;
  };
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({ 
  color = "#ffffff", 
  scale = [1, 1, 1],
  wireframe = true,
  modelUrl,
  onPartClick,
  category,
  specs
}) => {
  return (
    <div className="w-full h-full aspect-square bg-white border border-black overflow-hidden relative group">
      <div className="absolute inset-0 blueprint-grid pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      
      {/* Dynamic Specs Overlay - Blueprint Style */}
      {specs && (
        <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3 pointer-events-none">
           <div className="text-right">
              <div className="font-mono text-[9px] text-black/40 uppercase tracking-[0.2em] leading-none mb-1">SPEC_A // OUTPUT</div>
              <div className="font-mono text-[14px] text-black font-bold tracking-tight">{specs.power}</div>
           </div>
           <div className="w-16 h-[1px] bg-black/10"></div>
           <div className="text-right">
              <div className="font-mono text-[9px] text-black/40 uppercase tracking-[0.2em] leading-none mb-1">SPEC_B // AREA</div>
              <div className="font-mono text-[14px] text-black font-bold tracking-tight">{specs.area}</div>
           </div>
        </div>
      )}

      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[4, 3, 5]} fov={35} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={1} color="#ffffff" />
        
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <UnitModel 
              color="#ffffff" 
              scale={scale} 
              wireframe={wireframe} 
              modelUrl={modelUrl} 
              onPartClick={onPartClick}
              category={category}
            />
          </Float>
          <Environment preset="studio" />
        </Suspense>
        
        <Grid 
          infiniteGrid 
          fadeDistance={12} 
          cellColor="#000000" 
          sectionColor="#000000" 
          sectionSize={1.5} 
          cellSize={0.5} 
          cellThickness={0.5}
          sectionThickness={1}
          position={[0, -1.8, 0]}
        />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
      
      <div className="absolute top-6 left-6 font-mono text-[9px] text-black uppercase tracking-[4px] pointer-events-none opacity-30 leading-relaxed">
        PROTO: CD-BW-01<br/>
        CALIBRATION: ACTIVE<br/>
        SYSTEM: NOMINAL
      </div>

      {/* Interactive Legend Overlay - B&W */}
      <div className="absolute bottom-6 left-6 font-mono text-[9px] text-black flex flex-col gap-2 pointer-events-none opacity-60">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 border border-black"></div>
            <span className="tracking-widest uppercase text-[8px] font-bold">INV_CATALOG</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-black"></div>
            <span className="tracking-widest uppercase text-[8px] font-bold">CALC_MODULE</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 border-2 border-black rounded-full"></div>
            <span className="tracking-widest uppercase text-[8px] font-bold">AI_DIAGNOSTIC</span>
         </div>
      </div>
    </div>
  );
};
