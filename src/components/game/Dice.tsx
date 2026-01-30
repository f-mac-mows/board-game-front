"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Circle, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// --- 숫자별 회전 각도 정의 ---
const TARGET_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],              
  6: [0, Math.PI, 0],        
  3: [0, -Math.PI / 2, 0],   
  4: [0, Math.PI / 2, 0],    
  5: [-Math.PI / 2, 0, 0],   
  2: [Math.PI / 2, 0, 0],    
};

const DOT_GAP = 0.8;
const FACE_OFFSET = 1.76;

// --- 눈금 컴포넌트 (Keep 상태에 따라 색상 반전) ---
function DiceFace({ num, isKeep }: { num: number; isKeep: boolean }) {
  const positions: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-DOT_GAP, DOT_GAP], [DOT_GAP, -DOT_GAP]],
    3: [[-DOT_GAP, DOT_GAP], [0, 0], [DOT_GAP, -DOT_GAP]],
    4: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
    5: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [0, 0], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
    6: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [-DOT_GAP, 0], [DOT_GAP, 0], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
  };

  // 1은 빨간색 유지, 나머지는 Keep일 때 흰색으로 변경하여 대비 상승
  const dotColor = num === 1 ? "#ff4d4d" : (isKeep ? "#ffffff" : "#1e293b");

  return (
    <group>
      {positions[num].map((pos, i) => (
        <Circle key={i} args={[0.26, 32]} position={[pos[0], pos[1], 0]}>
          <meshStandardMaterial 
            color={dotColor} 
            roughness={0.1} 
            emissive={isKeep && num !== 1 ? "#ffffff" : "black"}
            emissiveIntensity={isKeep ? 0.5 : 0}
            polygonOffset 
            polygonOffsetFactor={-1} 
          />
        </Circle>
      ))}
    </group>
  );
}

// --- 메인 주사위 메쉬 로직 ---
function DiceMesh({ value, isRolling, isKeep }: { value: number; isRolling: boolean; isKeep: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (isRolling && !isKeep) {
      groupRef.current.rotation.x += delta * 15;
      groupRef.current.rotation.y += delta * 12;
      groupRef.current.rotation.z += delta * 8;
    } else {
      const target = TARGET_ROTATIONS[value] || [0, 0, 0];
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, target[0], 0.15);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, target[1], 0.15);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, target[2], 0.15);
    }

    // Keep 상태일 때 부드럽게 공중 부양
    if (isKeep) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, 
        0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.15, 
        0.1
      );
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.2);
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[3.5, 3.5, 3.5]} radius={0.5} smoothness={4}>
        <meshPhysicalMaterial 
          color={isKeep ? "#3b82f6" : "#ffffff"} 
          roughness={isKeep ? 0.05 : 0.1} 
          metalness={isKeep ? 0.1 : 0.05}
          // 반투명 설정: Keep일 때 보석 같은 느낌
          transmission={isKeep ? 0.5 : 0} 
          thickness={1.5}
          transparent={true}
          opacity={isKeep ? 0.9 : 1}
          emissive={isKeep ? "#1d4ed8" : "black"}
          emissiveIntensity={isKeep ? 0.5 : 0}
        />
      </RoundedBox>
      
      {/* 각 면 배치 */}
      <group position={[0, 0, FACE_OFFSET]}><DiceFace num={1} isKeep={isKeep} /></group>
      <group position={[0, 0, -FACE_OFFSET]} rotation={[0, Math.PI, 0]}><DiceFace num={6} isKeep={isKeep} /></group>
      <group position={[FACE_OFFSET, 0, 0]} rotation={[0, Math.PI / 2, 0]}><DiceFace num={3} isKeep={isKeep} /></group>
      <group position={[-FACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><DiceFace num={4} isKeep={isKeep} /></group>
      <group position={[0, FACE_OFFSET, 0]} rotation={[-Math.PI / 2, 0, 0]}><DiceFace num={5} isKeep={isKeep} /></group>
      <group position={[0, -FACE_OFFSET, 0]} rotation={[Math.PI / 2, 0, 0]}><DiceFace num={2} isKeep={isKeep} /></group>
    </group>
  );
}

// --- 최종 Export 컴포넌트 ---
interface DiceProps {
  value: number | string;
  isRolling: boolean;
  isKeep: boolean;
  onClick: () => void;
}

export default function Dice({ value, isRolling, isKeep, onClick }: DiceProps) {
  const numValue = typeof value === 'number' ? value : 1;

  return (
    <div className="relative group w-24 h-24 lg:w-32 lg:h-32 select-none">
      <div 
        className="w-full h-full cursor-pointer touch-none"
        onClick={onClick}
      >
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={35} />
          <ambientLight intensity={1.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={2} />
          
          <DiceMesh value={numValue} isRolling={isRolling} isKeep={isKeep} />
        </Canvas>
      </div>

      {/* 상단 KEEP 라벨 (애니메이션 추가) */}
      {isKeep && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none animate-in zoom-in duration-300 z-20">
          <span className="text-[10px] bg-blue-600 text-white px-3 py-0.5 rounded-full font-black shadow-[0_0_10px_rgba(37,99,235,0.5)] uppercase tracking-tighter">
            KEEP
          </span>
        </div>
      )}

      {/* 바닥 그림자: 공중 부양 시 작아지도록 처리 */}
      <div className={`
        absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-2 
        bg-black/30 rounded-[100%] blur-md transition-all duration-500 pointer-events-none
        ${isKeep ? "scale-50 opacity-10 translate-y-4" : "scale-100 opacity-40"}
        ${isRolling && !isKeep ? "animate-pulse" : ""}
      `} />
    </div>
  );
}