"use client";

import { useRef, useMemo, useState, useEffect } from "react";
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

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
      onPointerDown={() => setHovered(true)}
      onPointerUp={() => setHovered(false)}
    >
      <RoundedBox args={[3.5, 3.5, 3.5]} radius={0.4} smoothness={isMobile ? 2 : 4}>
        <meshStandardMaterial 
          color={hovered ? "#f8fafc" : "white"} 
          roughness={0.1} 
          metalness={0.05} 
          emissive={hovered ? "#3b82f6" : "black"} 
          emissiveIntensity={hovered ? 0.3 : 0}
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

// --- 4. 메인 캔버스 수정 ---
export default function FloatingDice({ className = "" }: { className?: string }) {
  const speed = useMemo(() => 0.4 + Math.random() * 3, []);

  return (
    <div className={`w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-32 flex items-center justify-center cursor-pointer transition-transform ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }} 
        gl={{ 
          alpha: true, 
          antialias: true,
          // ✨ 추가: 저전력 모드 설정 (여러 개를 띄울 때 성능 안정성 확보)
          powerPreference: "low-power",
          // ✨ 추가: 컨텍스트 손실 방지를 위해 명시적으로 보존 옵션 추가 가능 (선택)
          preserveDrawingBuffer: false,
        }}
        // ✨ 중요: 컴포넌트가 언마운트될 때 WebGL 리소스를 강제로 해제합니다.
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        // @react-three/fiber는 기본적으로 언마운트 시 dispose를 수행하지만, 
        // dpr 제한을 통해 모바일/저사양 기기에서 컨텍스트 해제를 방지합니다.
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <DiceMesh baseSpeed={speed} />
      </Canvas>
    </div>
  );
}