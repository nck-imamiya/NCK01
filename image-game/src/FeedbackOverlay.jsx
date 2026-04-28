import React from 'react';

const FeedbackOverlay = ({ type, visible }) => {
  if (!visible) return null;
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-[150] pointer-events-none transition-all duration-300 ${visible ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`}>
      <div className={`text-7xl font-black p-12 rounded-full bg-white/95 shadow-2xl ${type === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {type === 'correct' ? '正解！' : '不正解！'}
      </div>
    </div>
  );
};

export default FeedbackOverlay;