import React, { useState } from 'react';
import { Camera, Users, Grid, Scissors, Puzzle, Layers, FlaskConical, ImageIcon, ImageOff } from 'lucide-react';
import MessageBox from './MessageBox';

export default function SetupScreen({
  gameMode, setGameMode,
  playerCount, setPlayerCount,
  panelConfig, setPanelConfig,
  players, setPlayers,
  quizImages,
  handleFolderSelect, fileInputRef,
  startGame,
  startTestGame,
  setGameState,
  msg,
}) {
  const [showBackground, setShowBackground] = useState(true);

  return (
    <div className={`min-h-screen p-6 md:p-12 lg:p-20 overflow-y-auto relative transition-colors duration-700 ${!showBackground ? 'bg-slate-50' : ''}`}>
      {/* 背景画像レイヤー */}
      {showBackground && (
        <div 
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000"
          style={{ backgroundImage: "url('/background.png')" }}
        />
      )}

      {/* 背景切り替えボタン（控えめなデザイン） */}
      <button 
        onClick={() => setShowBackground(!showBackground)}
        className="fixed top-6 right-6 z-50 p-2 rounded-xl bg-white/10 hover:bg-white/30 text-indigo-900/20 hover:text-indigo-900/50 transition-all backdrop-blur-sm border border-white/10"
        title={showBackground ? "背景画像を隠す" : "背景画像を表示"}
      >
        {showBackground ? <ImageOff className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
      </button>

      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl font-black text-indigo-900 flex items-center gap-4 italic mb-2 tracking-tighter">
            <Camera className="w-12 h-12 text-indigo-500" />
            画像当てマスター
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* 左カラム: 設定系 */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <p className="text-indigo-900/40 font-black text-xs uppercase tracking-widest mb-6 border-b border-indigo-100 pb-2">01. ゲームモードを選択</p>
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => setGameMode('standard')} className={`p-8 rounded-[2rem] font-bold flex flex-col items-start gap-4 transition-all border-2 ${gameMode === 'standard' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl scale-[1.02]' : 'bg-white text-slate-400 border-white hover:border-indigo-100 shadow-sm'}`}>
                  <div className={`p-3 rounded-2xl ${gameMode === 'standard' ? 'bg-white/20' : 'bg-slate-50'}`}><Grid className="w-6 h-6" /></div>
                  <div className="text-left">
                    <span className="block text-lg font-black tracking-tight">通常モード</span>
                    <span className={`text-[10px] opacity-60 ${gameMode === 'standard' ? 'text-white' : 'text-slate-400'}`}>画像順にクイズを出題します</span>
                  </div>
                </button>
                <button onClick={() => setGameMode('category')} className={`p-8 rounded-[2rem] font-bold flex flex-col items-start gap-4 transition-all border-2 ${gameMode === 'category' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl scale-[1.02]' : 'bg-white text-slate-400 border-white hover:border-indigo-100 shadow-sm'}`}>
                  <div className={`p-3 rounded-2xl ${gameMode === 'category' ? 'bg-white/20' : 'bg-slate-50'}`}><Layers className="w-6 h-6" /></div>
                  <div className="text-left">
                    <span className="block text-lg font-black tracking-tight">カテゴリーモード</span>
                    <span className={`text-[10px] opacity-60 ${gameMode === 'category' ? 'text-white' : 'text-slate-400'}`}>ジャンルと点数を選択して挑戦</span>
                  </div>
                </button>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-12">
              <section>
                <p className="text-indigo-900/40 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Users className="w-3 h-3" /> プレイヤー人数
                </p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button key={num} onClick={() => setPlayerCount(num)} className={`w-12 h-12 rounded-2xl font-black transition-all ${playerCount === num ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-white text-indigo-400 hover:bg-indigo-50'}`}>
                      {num}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-indigo-900/40 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Grid className="w-3 h-3" /> パネル枚数
                </p>
                <div className="flex flex-wrap gap-2">
                  {[4, 8, 10, 16, 20].map(num => (
                    <button key={num} onClick={() => setPanelConfig(num)} className={`px-4 py-3 rounded-2xl font-black transition-all text-xs ${panelConfig === num ? 'bg-purple-600 text-white shadow-lg scale-110' : 'bg-white text-purple-400 hover:bg-purple-50'}`}>
                      {num}枚
                    </button>
                  ))}
                  <button onClick={() => setPanelConfig('tetris')} className={`px-4 py-3 rounded-2xl font-black transition-all text-xs flex items-center gap-2 ${panelConfig === 'tetris' ? 'bg-orange-500 text-white shadow-lg scale-110' : 'bg-white text-orange-400 hover:bg-orange-50'}`}>
                    <Puzzle className="w-3 h-3" /> テトリス
                  </button>
                </div>
              </section>
            </div>

            <section>
              <p className="text-indigo-900/40 font-black text-xs uppercase tracking-widest mb-6 border-b border-indigo-100 pb-2">02. 素材を準備</p>
              <label className="w-full flex items-center gap-6 p-8 bg-white text-indigo-500 rounded-[2rem] cursor-pointer hover:bg-indigo-50 transition-all border-2 border-dashed border-indigo-100 shadow-sm group">
                <div className="p-5 bg-indigo-50 rounded-3xl group-hover:bg-indigo-100 transition-colors"><Camera className="w-8 h-8" /></div>
                <div className="flex-1 text-left">
                  <span className="block text-lg font-black tracking-tight text-indigo-900">画像を読み込む</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">画像をフォルダごと選択してください</span>
                </div>
                <input type="file" ref={fileInputRef} webkitdirectory="true" directory="true" className="hidden" onChange={handleFolderSelect} />
              </label>
              {quizImages.length > 0 && <p className="mt-4 text-center text-emerald-600 font-black text-xs uppercase tracking-widest animate-bounce">✓ {quizImages.length} images loaded successfully</p>}
              
              <button 
                onClick={startTestGame}
                className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
              >
                <FlaskConical className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                テストモードで開始（画像不要）
              </button>
            </section>
          </div>

          {/* 右カラム: プレイヤー & 開始 */}
          <div className="lg:col-span-5 space-y-12">
            <section className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white">
              <p className="text-indigo-900/40 font-black text-xs uppercase tracking-widest mb-6 border-b border-indigo-100 pb-2">03. プレイヤー設定</p>
              <div className="space-y-3">
                {players.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-50">
                    <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">{idx + 1}</span>
                    <input type="text" value={p.name} maxLength={8} onChange={(e) => setPlayers(prev => prev.map(item => item.id === p.id ? { ...item, name: e.target.value } : item))} className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder-slate-300" placeholder={`プレイヤー ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-4">
              <button onClick={() => setGameState('editing')} disabled={quizImages.length === 0} className={`w-full py-6 rounded-[2rem] font-black transition-all flex items-center justify-center gap-3 text-lg ${quizImages.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-xl'}`}>
                <Scissors className="w-6 h-6" /> 素材を細かく加工する
                </button>
              <button onClick={startGame} disabled={quizImages.length === 0} className={`w-full py-8 rounded-[2rem] font-black text-white shadow-2xl transition-all text-2xl uppercase italic tracking-tighter ${quizImages.length === 0 ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-indigo-200'}`}>
                ゲームスタート！
              </button>
            </div>
          </div>
        </div>
      </div>
      <MessageBox message={msg.text} visible={msg.visible} />
    </div>
  );
}