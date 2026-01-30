"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Circle } from "@react-three/drei";
import * as THREE from "three";

// --- 1. 개별 점(Dot) 컴포넌트 ---
function Dot({ position, color = "#1e293b" }: { position: [number, number, number], color?: string }) {
  return (
    <Circle args={[0.25, 32]} position={position}>
      <meshStandardMaterial 
        color={color} 
        roughness={0.1} 
        polygonOffset 
        polygonOffsetFactor={-1} // Z-fighting 방지 강화
      />
    </Circle>
  );
}

// --- 2. 주사위 눈금 배치 로직 ---
const DOT_GAP = 0.8;
const FACE_OFFSET = 1.76;

function DiceFace({ num }: { num: number }) {
  const positions: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-DOT_GAP, DOT_GAP], [DOT_GAP, -DOT_GAP]],
    3: [[-DOT_GAP, DOT_GAP], [0, 0], [DOT_GAP, -DOT_GAP]],
    4: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
    5: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [0, 0], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
    6: [[-DOT_GAP, DOT_GAP], [DOT_GAP, DOT_GAP], [-DOT_GAP, 0], [DOT_GAP, 0], [-DOT_GAP, -DOT_GAP], [DOT_GAP, -DOT_GAP]],
  };

  const color = num === 1 ? "#ef4444" : "#1e293b";

  return (
    <group>
      {positions[num].map((pos, i) => (
        <Dot key={i} position={[pos[0], pos[1], 0]} color={color} />
      ))}
    </group>
  );
}

// --- 3. 주사위 본체 및 인터랙티브 로직 ---
function DiceMesh({ baseSpeed }: { baseSpeed: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  
  // 가변적인 속도와 높이를 부드럽게 적용하기 위한 보간용 값
  const targetSpeed = useRef(baseSpeed);
  const currentFloatingY = useRef(0);

  useFrame((state, delta) => {
    // 1. 호버 상태에 따라 목표 속도 설정 (호버 시 4배 가속)
    const multiplier = hovered ? 15.0 : 1.0;
    targetSpeed.current = THREE.MathUtils.lerp(targetSpeed.current, baseSpeed * multiplier, 0.1);

    // 2. 회전 애니메이션
    groupRef.current.rotation.x += delta * targetSpeed.current;
    groupRef.current.rotation.y += delta * (targetSpeed.current * 0.8);
    groupRef.current.rotation.z += delta * (targetSpeed.current * 0.3);

    // 3. 부양(Floating) 애니메이션 가속
    const floatFreq = hovered ? 6 : 2; // 호버 시 더 빠르게 위아래로
    const floatAmp = hovered ? 0.4 : 0.2; // 호버 시 더 높게 위아래로
    
    const t = state.clock.getElapsedTime();
    currentFloatingY.current = THREE.MathUtils.lerp(
      currentFloatingY.current, 
      Math.sin(t * floatFreq) * floatAmp, 
      0.1
    );
    groupRef.current.position.y = currentFloatingY.current;
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[3.5, 3.5, 3.5]} radius={0.4} smoothness={4}>
        <meshStandardMaterial 
          color={hovered ? "#f8fafc" : "white"} 
          roughness={0.1} 
          metalness={0.05} 
          emissive={hovered ? "#3b84f6" : "black"} // 호버 시 푸른 빛
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </RoundedBox>

      <group position={[0, 0, FACE_OFFSET]}><DiceFace num={1} /></group>
      <group position={[0, 0, -FACE_OFFSET]} rotation={[0, Math.PI, 0]}><DiceFace num={6} /></group>
      <group position={[FACE_OFFSET, 0, 0]} rotation={[0, Math.PI / 2, 0]}><DiceFace num={3} /></group>
      <group position={[-FACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><DiceFace num={4} /></group>
      <group position={[0, FACE_OFFSET, 0]} rotation={[-Math.PI / 2, 0, 0]}><DiceFace num={5} /></group>
      <group position={[0, -FACE_OFFSET, 0]} rotation={[Math.PI / 2, 0, 0]}><DiceFace num={2} /></group>
    </group>
  );
}

// --- 4. 메인 캔버스 ---
export default function FloatingDice() {
  const speed = useMemo(() => 0.4 + Math.random() * 0.4, []);

  return (
    <div className="w-24 h-32 lg:w-24 lg:h-32 flex items-center justify-center cursor-pointer">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <DiceMesh baseSpeed={speed} />
      </Canvas>
    </div>
  );
}