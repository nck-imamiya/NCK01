import React from 'react';
import { Trophy, Star } from 'lucide-react';
import Confetti from './Confetti';

export default function ResultScreen({ players, setGameState }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 relative">
      <Confetti />
      <div className="bg-white rounded-[4rem] p-12 md:p-20 w-full max-w-2xl text-center shadow-[0_60px_120px_rgba(0,0,0,0.7)] overflow-y-auto max-h-[90vh] border-[12px] border-indigo-900/5">
        <div className="relative inline-block mb-12 text-center w-full">
          <Trophy className="w-32 h-32 text-yellow-500 animate-bounce mx-auto" />
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <Star className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300 animate-spin-slow" />
        </div>
        <h1 className="text-6xl font-black text-indigo-950 mb-4 tracking-tighter uppercase italic leading-none text-center">終了！</h1>
        <p className="text-slate-400 mb-12 font-bold tracking-[0.4em] text-xs uppercase text-center font-sans">最終リザルト</p>
        
        <div className="space-y-4 mb-12">
          {sortedPlayers.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between p-6 rounded-[2.5rem] transition-all ${i === 0 ? 'bg-indigo-50 ring-2 ring-indigo-200 scale-110 shadow-2xl z-10' : 'bg-slate-50 opacity-80'}`}>
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${i === 0 ? 'bg-yellow-400 text-white shadow-lg' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                <span className="text-2xl font-black text-slate-800 tracking-tight">{p.name}</span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-indigo-600 font-mono leading-none">{p.score}</span>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1">ポイント</p>
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={() => setGameState('setup')} className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all active:scale-95 uppercase tracking-widest">タイトルへ戻る</button>
      </div>
    </div>
  );
}