import React, { useMemo } from 'react';

export default function CategorySelectScreen({ quizImages, players, currentPlayerIdx, selectCategoryQuiz, setGameState }) {
  const genres = useMemo(() => Array.from(new Set(quizImages.map(img => img.genre))), [quizImages]);
  const points = useMemo(() => Array.from(new Set(quizImages.map(img => img.pointValue))).sort((a, b) => a - b), [quizImages]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-white text-4xl font-black italic tracking-tighter mb-2 uppercase">Category Select</h2>
            <p className="text-indigo-400 font-bold">ジャンルと点数を選んでください</p>
          </div>
          <button onClick={() => setGameState('ended')} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-rose-700 shadow-lg transition-all">ゲームを終了する</button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-x-auto">
          <table className="w-full border-separate border-spacing-4 text-center">
            <thead>
              <tr>
                <th className="p-4"></th>
                {points.map(pt => (
                  <th key={pt} className="text-indigo-400 font-black text-2xl uppercase tracking-tighter">{pt}pts</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {genres.map(genre => (
                <tr key={genre}>
                  <td className="text-white font-black text-xl px-6 py-4 bg-white/5 rounded-2xl border border-white/5 text-left">{genre}</td>
                  {points.map(pt => {
                    const quizIdx = quizImages.findIndex(img => img.genre === genre && img.pointValue === pt && !img.isPlayed);
                    const isCompleted = quizIdx === -1;
                    return (
                      <td key={pt} className="text-center">
                        <button
                          disabled={isCompleted}
                          onClick={() => selectCategoryQuiz(quizIdx)}
                          className={`w-full py-6 rounded-2xl font-black text-2xl transition-all border-2
                            ${isCompleted 
                              ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-30' 
                              : 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/40'
                            }`}
                        >
                          {isCompleted ? 'CLEAR' : 'SELECT'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="fixed bottom-6 flex gap-4 overflow-x-auto px-10 w-full justify-center">
        {players.map((p, i) => (
          <div key={p.id} className={`px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white min-w-[120px] transition-all ${i === currentPlayerIdx ? 'ring-2 ring-indigo-500 bg-indigo-600/20' : ''}`}>
            <p className="text-[10px] font-bold opacity-60 uppercase">{p.name}</p>
            <p className="text-xl font-black">{p.score} <span className="text-xs opacity-50">pts</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}