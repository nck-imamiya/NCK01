import React from 'react';
import { Camera, Users, Grid, Scissors, Puzzle, Layers } from 'lucide-react';
import MessageBox from './MessageBox';

export default function SetupScreen({
  gameMode, setGameMode,
  playerCount, setPlayerCount,
  panelConfig, setPanelConfig,
  players, setPlayers,
  quizImages,
  handleFolderSelect, fileInputRef,
  startGame,
  setGameState,
  msg,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl border border-slate-100 overflow-y-auto max-h-[95vh]">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900 flex items-center justify-center gap-3 italic">
          <Camera className="w-8 h-8 text-indigo-500" />
          画像当てマスター
        </h1>

        <div className="mb-8">
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest text-center mb-4">ゲームモード</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setGameMode('standard')} className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all border-2 ${gameMode === 'standard' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}>
              <Grid className="w-5 h-5" />
              <span className="text-sm">通常モード</span>
            </button>
            <button onClick={() => setGameMode('category')} className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all border-2 ${gameMode === 'category' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}>
              <Layers className="w-5 h-5" />
              <span className="text-sm">カテゴリーモード</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-gray-600 font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Users className="w-4 h-4 text-indigo-400" /> プレイヤー人数
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button key={num} onClick={() => setPlayerCount(num)} className={`w-10 h-10 rounded-xl font-bold transition-all ${playerCount === num ? 'bg-indigo-600 text-white shadow-md scale-110' : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100'}`}>
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-600 font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Grid className="w-4 h-4 text-indigo-400" /> パネルモード
            </p>
            <div className="flex flex-wrap gap-2">
              {[4, 8, 10, 16, 20].map(num => (
                <button key={num} onClick={() => setPanelConfig(num)} className={`px-3 py-2 rounded-xl font-bold transition-all text-xs ${panelConfig === num ? 'bg-purple-600 text-white shadow-md scale-110' : 'bg-purple-50 text-purple-400 hover:bg-purple-100'}`}>
                  {num}枚
                </button>
              ))}
              <button onClick={() => setPanelConfig('tetris')} className={`px-3 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1 ${panelConfig === 'tetris' ? 'bg-orange-500 text-white shadow-md scale-110' : 'bg-orange-50 text-orange-400 hover:bg-orange-100'}`}>
                <Puzzle className="w-3 h-3" /> テトリス
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center">プレイヤー名</p>
          {players.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
              <input type="text" value={p.name} maxLength={8} onChange={(e) => setPlayers(prev => prev.map(item => item.id === p.id ? { ...item, name: e.target.value } : item))} className="flex-1 p-1.5 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/50 focus:bg-white text-sm" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-indigo-500 rounded-2xl border-2 border-indigo-100 border-dashed cursor-pointer hover:bg-indigo-50 transition-colors">
            <Camera className="w-8 h-8 mb-2" />
            <span className="text-xs font-bold uppercase tracking-tighter">画像を読み込む</span>
            <input type="file" ref={fileInputRef} webkitdirectory="true" directory="true" className="hidden" onChange={handleFolderSelect} />
          </label>
          {quizImages.length > 0 && <p className="text-center text-green-600 font-bold text-[10px]">✓ {quizImages.length} 枚読み込み済み</p>}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setGameState('editing')} disabled={quizImages.length === 0} className={`py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${quizImages.length === 0 ? 'bg-gray-100 text-gray-300' : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-sm'}`}>
              <Scissors className="w-4 h-4" /> 素材を加工
            </button>
            <button onClick={startGame} disabled={quizImages.length === 0} className={`py-4 rounded-2xl font-black text-white shadow-xl transition-all text-sm uppercase ${quizImages.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
              ゲーム開始
            </button>
          </div>
        </div>
      </div>
      <MessageBox message={msg.text} visible={msg.visible} />
    </div>
  );
}