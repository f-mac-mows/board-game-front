"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Circle } from "@react-three/drei";
import * as THREE from "three";

// --- 1. 개별 점(Dot) 컴포넌트 ---
function Dot({ position, color = "#1e293b" }: { position: [number, number, number], color?: string }) {
  return (
    <Circle args={[0.25, 32]} position={position}>
      <meshStandardMaterial color={color} roughness={0.1} />
    </Circle>
  );
}

// --- 2. 주사위 눈금 배치 로직 ---
const DOT_GAP = 0.8; // 점들 사이의 간격
const FACE_OFFSET = 1.76; // 주사위 반각(3.5/2)보다 아주 살짝 크게 설정 (Z-fighting 방지)

function DiceFace({ num }: { num: number }) {
  // 각 숫자별 점의 상대 좌표 (x, y)
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

// --- 3. 주사위 본체 및 조립 ---
function DiceMesh({ rotationSpeed }: { rotationSpeed: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.x = t * rotationSpeed;
    groupRef.current.rotation.y = t * (rotationSpeed * 0.8);
    groupRef.current.rotation.z = t * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* 주사위 몸체 */}
      <RoundedBox args={[3.5, 3.5, 3.5]} radius={0.4} smoothness={4}>
        <meshStandardMaterial color="white" roughness={0.1} metalness={0.05} />
      </RoundedBox>

      {/* 각 면의 눈금 배치 (6면) */}
      <group position={[0, 0, FACE_OFFSET]}><DiceFace num={1} /></group> {/* 앞 */}
      <group position={[0, 0, -FACE_OFFSET]} rotation={[0, Math.PI, 0]}><DiceFace num={6} /></group> {/* 뒤 */}
      <group position={[FACE_OFFSET, 0, 0]} rotation={[0, Math.PI / 2, 0]}><DiceFace num={3} /></group> {/* 우 */}
      <group position={[-FACE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><DiceFace num={4} /></group> {/* 좌 */}
      <group position={[0, FACE_OFFSET, 0]} rotation={[-Math.PI / 2, 0, 0]}><DiceFace num={5} /></group> {/* 상 */}
      <group position={[0, -FACE_OFFSET, 0]} rotation={[Math.PI / 2, 0, 0]}><DiceFace num={2} /></group> {/* 하 */}
    </group>
  );
}

// --- 4. 메인 캔버스 ---
export default function FloatingDice() {
  const speed = useMemo(() => 0.4 + Math.random() * 1.2, []);

  return (
    <div className="w-24 h-32 lg:w-24 lg:h-32 flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <DiceMesh rotationSpeed={speed} />
      </Canvas>
    </div>
  );
}