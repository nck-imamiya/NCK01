import React from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import FeedbackOverlay from './FeedbackOverlay';
import PlayerCutIn from './PlayerCutIn';
import MessageBox from './MessageBox';

export default function PlayingScreen({
  quizImages, currentIdx,
  players, currentPlayerIdx,
  panels, removePanel,
  isDoublePoints, setIsDoublePoints,
  handleAnswer,
  basePoint, getGridClass,
  isStageLoading,
  tetrisLayout,
  feedback, cutIn, msg,
  setGameState,
  panelConfig,
}) {
  const currentImg = quizImages[currentIdx];
  const visiblePanelsCount = panels.filter(p => p.visible).length;
  const currentMaxPoints = visiblePanelsCount * basePoint * (isDoublePoints ? 2 : 1);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* 背景装飾 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
      </div>

      {/* プレイヤースコアリスト */}
      <div className="fixed top-6 left-6 flex flex-col gap-3 z-30">
        {players.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-4 px-5 py-3 rounded-[1.5rem] border-2 transition-all duration-300 ${i === currentPlayerIdx ? 'bg-indigo-600 border-white shadow-[0_0_30px_rgba(79,70,229,0.5)] scale-110 z-10' : 'bg-white/5 border-white/10 opacity-40'}`}>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-[10px]">{i + 1}</div>
            <div>
              <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">{p.name}</p>
              <p className="text-white text-xl font-black leading-none">{p.score}<span className="text-[10px] ml-1 opacity-50 font-normal">pts</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <div className="text-white mb-8 text-center">
          <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-[10px] font-black mb-3 backdrop-blur-sm border border-white/10 uppercase tracking-[0.3em] text-indigo-300">
            第 {currentIdx + 1} 問 / 全 {quizImages.length} 問
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl italic">
            獲得可能: <span className="text-indigo-400 font-mono">{currentMaxPoints}</span> <span className="text-xl italic font-normal text-white/50">PTS</span>
          </h2>
        </div>

        <div className="w-full flex items-center justify-center p-4 min-h-[50vh]">
          {currentImg && (
            <div className={`relative w-full max-w-4xl aspect-video rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] border-[12px] border-white/5 bg-black overflow-hidden group transition-all duration-500 ${isStageLoading ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
              {!isStageLoading && (
                <>
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={currentImg.url} className="w-full h-full object-contain" style={{ transform: `scale(${currentImg.settings.scale}) translate(${currentImg.settings.x}%, ${currentImg.settings.y}%)` }} alt="Quiz" />
                  </div>
                  
                  <div className={`absolute inset-0 grid ${getGridClass()} gap-0`}>
                    {panelConfig === 'tetris' ? (
                      tetrisLayout.flatMap((row, rIdx) => 
                        row.map((pieceId, cIdx) => {
                          const piece = panels.find(p => p.id === pieceId);
                          if (!piece) return null;
                          
                          const pieceCells = [];
                          tetrisLayout.forEach((r, ri) => r.forEach((p, ci) => { if(p === pieceId) pieceCells.push({ri, ci}); }));
                          const cellIndexInPiece = pieceCells.findIndex(c => c.ri === rIdx && c.ci === cIdx);

                          const hasTop = rIdx > 0 && tetrisLayout[rIdx-1][cIdx] === pieceId;
                          const hasBottom = rIdx < 4 && tetrisLayout[rIdx+1][cIdx] === pieceId;
                          const hasLeft = cIdx > 0 && tetrisLayout[rIdx][cIdx-1] === pieceId;
                          const hasRight = cIdx < 7 && tetrisLayout[rIdx][cIdx+1] === pieceId;

                          const assignedNum = cellIndexInPiece === 0 ? piece.assignedNumbers[0] 
                                          : cellIndexInPiece === 2 ? piece.assignedNumbers[1] 
                                          : null;

                          return (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              onClick={() => removePanel(pieceId)}
                              className={`relative flex items-center justify-center cursor-pointer transition-all duration-500 box-border
                                ${piece.visible ? `${piece.color} opacity-100` : 'opacity-0 pointer-events-none scale-90 blur-xl'}
                                ${!hasTop ? 'border-t-[6px]' : 'border-t-[1px] border-white/10'}
                                ${!hasBottom ? 'border-b-[6px]' : 'border-b-[1px] border-white/10'}
                                ${!hasLeft ? 'border-l-[6px]' : 'border-l-[1px] border-white/10'}
                                ${!hasRight ? 'border-r-[6px]' : 'border-r-[1px] border-white/10'}
                                border-black/40
                              `}
                            >
                              {piece.visible && (
                                  <div className={`absolute inset-0 pointer-events-none border-t-[4px] border-l-[4px] border-white/30`}></div>
                              )}

                              {assignedNum && piece.visible && (
                                <div className="z-10 animate-in fade-in zoom-in duration-300">
                                  <span className="bg-black/50 text-white font-black text-2xl md:text-4xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-md">
                                    {assignedNum}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )
                    ) : (
                      panels.map(p => (
                        <div
                          key={p.id}
                          onClick={() => removePanel(p.id)}
                          className={`relative flex items-center justify-center cursor-pointer transition-all duration-500 transform overflow-hidden
                            ${p.visible ? `${p.color} opacity-100` : 'opacity-0 pointer-events-none scale-90 blur-xl'}
                            border border-black/20
                          `}
                        >
                          <div className="flex flex-wrap justify-center gap-1.5 p-2">
                            {p.assignedNumbers.map(n => (
                              <span key={n} className="bg-black/30 text-white font-black text-xl md:text-3xl w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-2xl shadow-inner hover:bg-black/50 transition-all border border-white/10">
                                {n}
                              </span>
                            ))}
                          </div>
                          {p.visible && <div className={`absolute inset-0 pointer-events-none border-t-[2px] border-l-[2px] border-white/20`}></div>}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center gap-12">
          <button onClick={() => handleAnswer(true)} className="group flex flex-col items-center gap-3 transition-transform active:scale-90">
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-all">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <span className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em]">正解</span>
          </button>
          <button onClick={() => setIsDoublePoints(prev => !prev)} disabled={isDoublePoints || isStageLoading} className={`px-12 py-6 rounded-[2rem] font-black transition-all shadow-xl active:scale-95 text-xl tracking-tighter ${isDoublePoints ? 'bg-orange-500 text-white animate-pulse shadow-orange-500/50' : 'bg-white text-indigo-950 hover:bg-indigo-50 hover:scale-105'}`}>
            {isDoublePoints ? '2倍ブースト中' : 'ポイント2倍！！'}
          </button>
          <button onClick={() => handleAnswer(false)} className="group flex flex-col items-center gap-3 transition-transform active:scale-90">
            <div className="w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.4)] group-hover:scale-110 transition-all">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <span className="text-rose-400 font-black text-xs uppercase tracking-[0.2em]">不正解</span>
          </button>
        </div>
      </div>

      <FeedbackOverlay type={feedback.type} visible={feedback.visible} />
      <PlayerCutIn playerName={cutIn.name} visible={cutIn.visible} />
      <MessageBox message={msg.text} visible={msg.visible} />
      <button onClick={() => setGameState('setup')} className="fixed bottom-6 right-6 p-4 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white rounded-full transition-all border border-white/5"><RotateCcw className="w-6 h-6" /></button>
    </div>
  );
}