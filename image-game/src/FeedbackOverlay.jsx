import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackOverlay = ({ type, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1.1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none"
        >
          <div className={`text-7xl font-black p-12 rounded-full bg-white/95 shadow-[0_0_60px_rgba(255,255,255,0.5)] backdrop-blur-sm ${type === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {type === 'correct' ? '正解！' : '不正解！'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackOverlay;