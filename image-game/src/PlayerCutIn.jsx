import React from 'react';

const PlayerCutIn = ({ playerName, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] overflow-hidden bg-slate-950">
      <div className="text-white w-full py-20 flex flex-col items-center justify-center animate-in slide-in-from-left duration-500">
        <span className="text-sm font-bold tracking-[0.5em] mb-4 text-indigo-400 uppercase">Turn Start</span>
        <h2 className="text-6xl font-black italic tracking-tighter text-center">
          {playerName} <span className="text-3xl font-normal not-italic ml-4 text-indigo-300">のターン！</span>
        </h2>
      </div>
    </div>
  );
};

export default PlayerCutIn;