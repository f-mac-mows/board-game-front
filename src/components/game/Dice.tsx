"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Circle, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const TARGET_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],              
  6: [0, Math.PI, 0],        
  3: [0, -Math.PI / 2, 0],   
  4: [0, Math.PI / 2, 0],    
  2: [-Math.PI / 2, 0, 0],
  5: [Math.PI / 2, 0, 0],
};

const DOT_GAP = 0.8;
const FACE_OFFSET = 1.76;

function DiceFace({ num, isKeep }: { num: number; isKeep: boolean }) {
  const positions: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-DOT_GAP, DOT_GAP], [DOT_GAP, -DOT_GAP]],
    3: [[-DOT_GAP, DOT_GAP], [0, 0], [DOT_GAP, -DOT_GAP]],
    4: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
    5: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [0, 0], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
    6: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [-DOT_GAP, 0], [DOT_GAP, 0], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
  };

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
          transmission={isKeep ? 0.5 : 0} 
          thickness={1.5}
          transparent={true}
          opacity={isKeep ? 0.9 : 1}
          emissive={isKeep ? "#1d4ed8" : "black"}
          emissiveIntensity={isKeep ? 0.5 : 0}
        />
      </RoundedBox>
      <group position={[0, 0, FACE_OFFSET]}><DiceFace num={1} isKeep={isKeep} /></group>
      <group position={[0, 0, -FACE_OFFSET]} rotation={[0, Math.PI, 0]}><DiceFace num={6} isKeep={isKeep} /></group>
      <group position={[FACE_OFFSET, 0, 0]} rotation={[0, Math.PI / 2, 0]}><DiceFace num={3} isKeep={isKeep} /></group>
      <group position={[-FACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><DiceFace num={4} isKeep={isKeep} /></group>
      <group position={[0, FACE_OFFSET, 0]} rotation={[-Math.PI / 2, 0, 0]}><DiceFace num={5} isKeep={isKeep} /></group>
      <group position={[0, -FACE_OFFSET, 0]} rotation={[Math.PI / 2, 0, 0]}><DiceFace num={2} isKeep={isKeep} /></group>
    </group>
  );
}

interface DiceProps {
  value: number | string;
  isRolling: boolean;
  isKeep: boolean;
  onClick: () => void;
}

export default function Dice({ value, isRolling, isKeep, onClick }: DiceProps) {
  const numValue = typeof value === 'number' ? value : 1;
  const [cameraZ, setCameraZ] = useState(9);

  // 모바일 대응: 화면 크기에 따라 카메라 거리 조절
  useEffect(() => {
    const handleResize = () => {
      setCameraZ(window.innerWidth < 768 ? 13 : 9);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative group w-16 h-16 sm:w-20 sm:h-20 lg:w-32 lg:h-32 select-none">
      <div className="w-full h-full cursor-pointer touch-none" onClick={onClick}>
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, cameraZ]} fov={35} />
          <ambientLight intensity={1.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <DiceMesh value={numValue} isRolling={isRolling} isKeep={isKeep} />
        </Canvas>
      </div>

      {isKeep && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
          <span className="text-[8px] lg:text-[10px] bg-blue-600 text-white px-2 lg:px-3 py-0.5 rounded-full font-black shadow-lg uppercase">
            KEEP
          </span>
        </div>
      )}

      <div className={`
        absolute bottom-0 left-1/2 -translate-x-1/2 w-10 lg:w-14 h-1 
        bg-black/30 rounded-[100%] blur-md transition-all duration-500
        ${isKeep ? "scale-50 opacity-10 translate-y-2" : "scale-100 opacity-40"}
      `} />
    </div>
  );
}