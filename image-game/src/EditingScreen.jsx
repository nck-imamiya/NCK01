import React from 'react';
import { ChevronLeft, ChevronRight, Download, Scissors } from 'lucide-react';
import MessageBox from './MessageBox';

export default function EditingScreen({
  quizImages,
  editIdx, setEditIdx,
  updateImageSetting,
  downloadImage,
  exportCanvasRef,
  setGameState,
  startGame,
  msg,
}) {
  const currentEdit = quizImages[editIdx];

  if (!currentEdit) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between border-b border-slate-200 sticky top-0 z-50">
        <button onClick={() => setGameState('setup')} className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-bold text-sm">
          <ChevronLeft className="w-5 h-5" /> 戻る
        </button>
        <div className="text-center">
          <h2 className="font-black text-slate-800 text-lg">画像加工スタジオ</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{editIdx + 1} / {quizImages.length}</p>
        </div>
        <button onClick={startGame} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-black transition-all">
          準備完了
        </button>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-8 items-center justify-center overflow-y-auto">
        <div className="w-full lg:w-3/4 flex flex-col items-center">
           <div className="w-full bg-slate-200 p-2 rounded-[2.5rem] shadow-inner">
             <div className={`relative mx-auto bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white transition-all duration-300 ${
               currentEdit.settings.isPortrait ? 'h-[85vh] aspect-[9/16]' : 'w-full aspect-video'
             }`}>
                <div className="w-full h-full flex items-center justify-center">
                  <img src={currentEdit.url} className="w-full h-full object-cover" 
                       style={{ transform: `scale(${currentEdit.settings.scale}) translate(${currentEdit.settings.x}%, ${currentEdit.settings.y}%)`, transition: 'transform 0.1s ease-out' }} alt="edit" />
                </div>
                <div className="absolute inset-0 pointer-events-none border-[12px] border-black/10 ring-1 ring-inset ring-white/20"></div>
             </div>
           </div>
           <div className="mt-8 w-full max-w-md bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase px-2">保存用ファイル名</span>
              <span className="text-sm font-mono text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg truncate max-w-[200px]">{currentEdit.name}_edited.png</span>
           </div>
        </div>
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-8">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-3 text-center text-indigo-500">微調整パネル</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-3"><span>ズーム</span><span className="text-indigo-600">{Math.round(currentEdit.settings.scale * 100)}%</span></div>
                <input type="range" min="1" max="4" step="0.05" value={currentEdit.settings.scale} onChange={(e) => updateImageSetting(editIdx, { scale: parseFloat(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-3"><span>横位置 (X)</span><span className="text-indigo-600">{currentEdit.settings.x}%</span></div>
                <input type="range" min="-100" max="100" step="1" value={currentEdit.settings.x} onChange={(e) => updateImageSetting(editIdx, { x: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-3"><span>縦位置 (Y)</span><span className="text-indigo-600">{currentEdit.settings.y}%</span></div>
                <input type="range" min="-100" max="100" step="1" value={currentEdit.settings.y} onChange={(e) => updateImageSetting(editIdx, { y: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
            </div>
            <button onClick={downloadImage} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"><Download className="w-5 h-5" /> 加工済みを保存</button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setEditIdx(prev => Math.max(0, prev - 1))} className="flex-1 bg-white border border-slate-200 text-slate-400 p-4 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm"><ChevronLeft className="mx-auto" /></button>
            <button onClick={() => setEditIdx(prev => Math.min(quizImages.length - 1, prev + 1))} className="flex-1 bg-white border border-slate-200 text-slate-400 p-4 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm"><ChevronRight className="mx-auto" /></button>
          </div>
          <button onClick={() => updateImageSetting(editIdx, { scale: 1, x: 0, y: 0 })} className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all underline">リセット</button>
        </div>
      </div>
      <canvas ref={exportCanvasRef} className="hidden" />
      <MessageBox message={msg.text} visible={msg.visible} />
    </div>
  );
}