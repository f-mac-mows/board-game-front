"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface GameOverProps {
  isVisible: boolean;
  data: any;
}

export default function RummikubGameOver({ isVisible, data }: GameOverProps) {
  const router = useRouter();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-100 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 p-12 rounded-[50px] border border-slate-800 text-center shadow-2xl max-w-md w-full"
        >
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 mb-6 italic">
            GAME OVER
          </h2>
          
          <div className="mb-10 space-y-2">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Winner</p>
            <p className="text-white text-4xl font-black">{data?.winnerNickname || "Unknown"}</p>
          </div>

          {/* 추가적인 점수판이나 통계를 여기에 넣을 수 있습니다 */}
          
          <button 
            onClick={() => router.push('/rooms')} 
            className="w-full py-5 bg-white text-black rounded-3xl font-black text-xl hover:bg-slate-200 transition-transform active:scale-95"
          >
            RETURN TO LOBBY
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}