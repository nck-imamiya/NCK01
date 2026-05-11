import React, { useState, useEffect, memo } from 'react';
import { CheckCircle, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import FeedbackOverlay from './FeedbackOverlay';
import PlayerCutIn from './PlayerCutIn';
import MessageBox from './MessageBox';

// スコアがドゥルドゥル増えるコンポーネント
const RollingNumber = ({ from, added, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(from);
  const [isRolling, setIsRolling] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // 獲得ポイントの大きさに応じて振動の強さを計算（最小2px 〜 最大15px程度にクランプ）
  const intensity = Math.max(2, Math.min(added / 40, 15));

  useEffect(() => {
    let controls;
    
    // 指定された delay 秒後にカウントアップを開始
    const timeoutId = setTimeout(() => {
      setIsRolling(true);
      setIsFinished(false);
      
      // framer-motionのanimate関数で数値を滑らかに補完
      controls = animate(from, from + added, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(Math.floor(latest));
        },
        onComplete: () => {
          setIsRolling(false);
          setIsFinished(true);
        }
      });
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (controls) controls.stop();
    };
  }, [from, added, delay]);

  return (
    <motion.span
      className="inline-block"
      animate={
        isRolling 
          ? { 
              x: [0, -intensity, intensity, -intensity, intensity, 0], 
              y: [0, intensity / 2, -intensity / 2, intensity / 2, -intensity / 2, 0] 
            } 
          : isFinished 
          ? { 
              scale: [1, 1.2, 1], 
              filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
              textShadow: ["0 0 0px #fff", "0 0 40px #fff", "0 0 0px #fff"]
            }
          : { x: 0, y: 0, scale: 1, filter: "brightness(1)" }
      }
      transition={
        isRolling ? { duration: 0.1, repeat: Infinity } : isFinished ? { duration: 0.4, ease: "easeOut" } : { duration: 0.2 }
      }
    >
      {displayValue}
    </motion.span>
  );
};

// パネルグリッド部分を独立させてメモ化（パフォーマンス向上の肝）
const QuizBoard = memo(({ 
  currentImg, isStageLoading, getGridClass, panelConfig, tetrisLayout, panels, handlePanelClick, hitPanels 
}) => {
  if (!currentImg) return null;
  
  return (
    <div className={`relative w-full max-w-4xl aspect-video rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] border-[12px] border-white/5 bg-black group transition-all duration-500 ${isStageLoading ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
      {!isStageLoading && (
        <>
          <div className="w-full h-full flex items-center justify-center rounded-[2.2rem] overflow-hidden">
            <img 
              src={currentImg.url} 
              className="w-full h-full object-contain" 
              style={{ 
                transform: `scale(${currentImg.settings.scale}) translate(${currentImg.settings.x}%, ${currentImg.settings.y}%)`,
                willChange: 'transform'
              }} 
              alt="Quiz" 
            />
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
                      onClick={() => handlePanelClick(pieceId)}
                      className={`relative flex items-center justify-center cursor-pointer transition-all duration-500 transform box-border
                        ${piece.visible ? `${piece.color} opacity-100` : 'opacity-0 pointer-events-none scale-90 blur-xl'}
                        ${!hasTop ? 'border-t-[6px]' : 'border-t-[1px] border-white/10'}
                        ${!hasBottom ? 'border-b-[6px]' : 'border-b-[1px] border-white/10'}
                        ${!hasLeft ? 'border-l-[6px]' : 'border-l-[1px] border-white/10'}
                        ${!hasRight ? 'border-r-[6px]' : 'border-r-[1px] border-white/10'}
                        border-black/40
                      `}
                    >
                      {assignedNum && piece.visible && (
                        <div className="z-10">
                          <span className="bg-black/50 text-white font-black text-2xl md:text-4xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-md">
                            {assignedNum}
                          </span>
                        </div>
                      )}

                      {/* ダーツ演出 (テトリス) - ピースの最初のセルにのみ表示 */}
                      {hitPanels[pieceId] && cellIndexInPiece === 0 && (
                        <motion.img
                          src="/dart.png"
                          initial={{ 
                            x: 400, y: -400, opacity: 0, scale: 4, rotate: -30, filter: 'blur(10px)' 
                          }}
                          animate={{ 
                            x: 5, y: -30, opacity: 1, scale: 0.8, 
                            rotate: [-30, -15, -18, -13, -15], 
                            filter: 'blur(0px)' 
                          }}
                          transition={{ 
                            duration: 0.4,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                          className="absolute z-50 w-24 h-24 pointer-events-none origin-bottom"
                          style={{ filter: 'drop-shadow(4px 8px 12px rgba(0,0,0,0.7))' }}
                        />
                      )}
                    </div>
                  );
                })
              )
            ) : (
              panels.map(p => (
                <div
                  key={p.id}
                  onClick={() => handlePanelClick(p.id)}
                  className={`relative flex items-center justify-center cursor-pointer transition-all duration-500 transform
                    ${p.visible ? `${p.color} opacity-100` : 'opacity-0 pointer-events-none scale-90 blur-xl'}
                    border border-black/20
                  `}
                >
                  <div className="flex flex-wrap justify-center gap-1.5 p-2">
                    {p.assignedNumbers.map(n => (
                      <span key={n} className="bg-black/30 text-white font-black text-xl md:text-3xl w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-2xl border border-white/10">
                        {n}
                      </span>
                    ))}
                  </div>

                  {/* ダーツ演出 (通常パネル) */}
                  {hitPanels[p.id] && (
                    <motion.img
                      src="/dart.png"
                      initial={{ 
                        x: 500, y: -500, opacity: 0, scale: 5, rotate: -35, filter: 'blur(12px)' 
                      }}
                      animate={{ 
                        x: 15, y: -40, opacity: 1, scale: 1, 
                        rotate: [-35, -15, -18, -13, -15], 
                        filter: 'blur(0px)' 
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      className="absolute z-50 w-28 h-28 pointer-events-none origin-bottom"
                      style={{ filter: 'drop-shadow(6px 12px 16px rgba(0,0,0,0.8))' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default function PlayingScreen({
  quizImages, currentIdx,
  players, currentPlayerIdx,
  panels, removePanel,
  handleAnswer,
  basePoint, getGridClass,
  isStageLoading,
  isCorrectAndWaiting,
  pendingJudge, setPendingJudge,
  isJudging, startJudging,
  tetrisLayout,
  feedback, cutIn, msg, scoringInfo,
  proceedToNext,
  setGameState,
  panelConfig,
  gameMode,
}) {
  const currentImg = quizImages[currentIdx];
  const visiblePanelsCount = panels.filter(p => p.visible).length;
  const currentMaxPoints = gameMode === 'category' 
    ? currentImg.pointValue 
    : visiblePanelsCount * basePoint;

  // ダーツが刺さったパネルを管理する状態
  const [hitPanels, setHitPanels] = useState({});
  const [isDartFlying, setIsDartFlying] = useState(false);

  // 問題が切り替わったらダーツの状態をリセット
  useEffect(() => {
    setHitPanels({});
    setIsDartFlying(false);
  }, [currentIdx]);

  // ジャッジ開始時のダーツ制御
  // キーボードイベントの登録 (Aキー: 正解, Dキー: 不正解)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCorrectAndWaiting || isStageLoading || isJudging) return;
      const key = e.key.toLowerCase();
      if (key === 'a') {
        setPendingJudge('correct');
      } else if (key === 'd') {
        setPendingJudge('incorrect');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCorrectAndWaiting, isStageLoading, isJudging, setPendingJudge]);

  // パネルクリック時の演出用ハンドラ
  const handlePanelClick = (id) => {
    if (hitPanels[id] || isStageLoading || isDartFlying) return;
    setIsDartFlying(true);
    setHitPanels(prev => ({ ...prev, [id]: true }));
    
    // ダーツが飛んで刺さる演出を待ってからパネルを開く（1秒後に実行）
    setTimeout(() => {
      removePanel(id);
      setIsDartFlying(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* 背景装飾 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
      </div>

      {/* プレイヤースコアリスト */}
      <div className="fixed top-6 left-6 flex flex-col gap-3 z-30">
        {players.map((p, i) => {
          const isScoring = scoringInfo && scoringInfo.playerIdx === i;
          return (
            <motion.div 
              layoutId={`player-card-${p.id}`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              key={p.id} 
              className={`flex items-center gap-4 px-5 py-3 rounded-[1.5rem] border-2 ${i === currentPlayerIdx ? 'bg-indigo-600 border-white shadow-[0_0_30px_rgba(79,70,229,0.5)] scale-110 z-10' : 'bg-white/5 border-white/10 opacity-40'} ${isScoring ? 'invisible' : ''}`}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-[10px]">{i + 1}</div>
              <div>
                <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">{p.name}</p>
                <p className="text-white text-xl font-black leading-none">{p.score}<span className="text-[10px] ml-1 opacity-50 font-normal">pts</span></p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* スコア加算アニメーション・オーバーレイ */}
      <AnimatePresence>
        {scoringInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              layoutId={`player-card-${players[scoringInfo.playerIdx].id}`}
              className="bg-indigo-600 border-4 border-white p-16 rounded-[4rem] shadow-[0_0_120px_rgba(79,70,229,0.8)] flex flex-col items-center gap-8"
              initial={{ scale: 1 }}
              animate={{ scale: 1.5 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-3xl">
                {scoringInfo.playerIdx + 1}
              </div>

              <div className="text-center">
                <p className="text-white text-lg font-black uppercase tracking-[0.4em] opacity-80 mb-6">{players[scoringInfo.playerIdx].name}</p>
                <div className="text-white text-9xl font-black italic tracking-tighter leading-none mb-6">
                  <RollingNumber from={scoringInfo.startScore} added={scoringInfo.addedPoints} delay={1000} />
                  <span className="text-3xl ml-4 opacity-50 not-italic">pts</span>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-yellow-400 text-3xl font-black"
                >
                  +{scoringInfo.addedPoints} !!
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <div className="text-white mb-8 text-center">
          {gameMode === 'category' && (
            <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-[10px] font-black mb-3 backdrop-blur-sm border border-white/10 uppercase tracking-[0.3em] text-indigo-300">
              {`${currentImg.genre} / ${currentImg.pointValue}pts`}
            </div>
          )}
          <h2 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl italic">
            獲得可能: <span className="text-indigo-400 font-mono">{currentMaxPoints}</span> <span className="text-xl italic font-normal text-white/50">PTS</span>
          </h2>
        </div>

        <div className="w-full flex items-center justify-center p-4 min-h-[50vh]">
          <QuizBoard 
            currentImg={currentImg}
            isStageLoading={isStageLoading}
            getGridClass={getGridClass}
            panelConfig={panelConfig}
            tetrisLayout={tetrisLayout}
            panels={panels}
            handlePanelClick={handlePanelClick}
            hitPanels={hitPanels}
          />
        </div>

        <div className="mt-12 flex items-center gap-12 relative">
          {!isCorrectAndWaiting ? (
            <div className="flex flex-col items-center gap-4 relative">
              {/* ジャッジ判明時のバーストエフェクト */}
              <AnimatePresence>
                {feedback.visible && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed inset-0 z-[190] flex items-center justify-center pointer-events-none will-change-transform"
                  >
                    <div className={`w-64 h-64 rounded-full blur-xl ${
                      feedback.type === 'correct' 
                        ? 'bg-emerald-400/40' 
                        : 'bg-rose-400/40'
                    }`} />
                    <div className={`absolute w-48 h-48 rounded-full border-[16px] ${
                      feedback.type === 'correct' ? 'border-emerald-400' : 'border-rose-400'
                    }`} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                key={`judge-button-${pendingJudge || 'none'}`}
                initial={pendingJudge ? { scale: 0.9, opacity: 0.8 } : {}}
                animate={{
                  scale: feedback.visible ? 2.5 : (isJudging ? 1.4 : (pendingJudge ? 1 : 1)),
                  y: (isJudging || feedback.visible) ? -300 : 0,
                  opacity: (feedback.visible || (isStageLoading && !isJudging)) ? 0 : (pendingJudge ? 1 : 0.8),
                  boxShadow: isJudging ? "0 0 80px rgba(99,102,241,0.8)" : (pendingJudge ? "0 0 40px rgba(99,102,241,0.5)" : "none"),
                  zIndex: (isJudging || feedback.visible) ? 150 : 10
                }}
                transition={feedback.visible ? { duration: 0.4, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 25 }}
                disabled={!pendingJudge || isJudging || isStageLoading}
                onClick={startJudging}
                className={`relative w-56 h-56 rounded-full font-black text-3xl shadow-2xl uppercase italic tracking-tighter overflow-hidden border-[12px] flex items-center justify-center transition-colors duration-300 will-change-transform
                  ${(!pendingJudge && !feedback.visible) ? 'bg-slate-800 text-slate-600 border-slate-700 opacity-50 cursor-not-allowed' : 
                    (isJudging || feedback.visible) ? 'bg-indigo-950 text-white border-white' : 'bg-white text-indigo-900 border-indigo-500 hover:scale-105 active:scale-95'}`}
              >
                {isJudging && (
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    style={{ originY: 1 }}
                    transition={{ duration: 2, ease: "linear", delay: 0.5 }}
                    className="absolute inset-0 bg-indigo-500/60 backdrop-blur-sm z-0"
                  />
                )}

                <span className="relative z-10 flex flex-col items-center justify-center gap-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                  {isJudging ? (
                    <>
                      <motion.img
                        src="/dart.png"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-10 h-10 object-contain"
                      />
                      <span className="text-xl">JUDGING...</span>
                    </>
                  ) : (
                    'Judge'
                  )}
                </span>
              </motion.button>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                A (Correct) / D (Incorrect)
              </p>
            </div>
          ) : (
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={proceedToNext} 
              className="group relative px-20 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-2xl shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center gap-4 italic tracking-tighter"
            >
              次へ進む
              <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          )}
        </div>
      </div>

      <FeedbackOverlay type={feedback.type} visible={feedback.visible} />
      <PlayerCutIn playerName={cutIn.name} visible={cutIn.visible} />
      <MessageBox message={msg.text} visible={msg.visible} />
      <button onClick={() => setGameState('setup')} className="fixed bottom-6 right-6 p-4 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white rounded-full transition-all border border-white/5"><RotateCcw className="w-6 h-6" /></button>
    </div>
  );
}