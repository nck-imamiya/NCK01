import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerCutIn = ({ playerName, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-[200] overflow-hidden pointer-events-none"
        >
          {/* 背景のオーバーレイ（ぼかし） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* 中央のシネマティックバー */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-full h-48 md:h-64 bg-gradient-to-r from-transparent via-indigo-900/40 to-transparent border-y border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]"
          />

          {/* テキストコンテンツ */}
          <div className="relative flex flex-col items-center text-white text-center">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs md:text-sm font-black tracking-[0.8em] mb-4 text-indigo-400 uppercase drop-shadow-lg"
            >
              Turn Start
            </motion.span>
            <motion.h2
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 15 }}
              className="text-6xl md:text-8xl font-black italic tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              {playerName}
              <span className="text-2xl md:text-4xl font-normal not-italic ml-6 text-indigo-300">のターン</span>
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerCutIn;