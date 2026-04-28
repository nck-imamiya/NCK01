import React, { useState, useEffect, useRef } from 'react';
import { Camera, XCircle, CheckCircle, RotateCcw, Trophy, Users, Grid, Edit3, Download, ChevronLeft, ChevronRight, Scissors, Puzzle, Star } from 'lucide-react';

// --- Tetris Mode Patterns ---
const TETRIS_PATTERNS = [
  [
    [0,0,0,0,1,2,2,2],
    [3,3,3,1,1,1,2,4],
    [3,5,6,6,7,7,4,4],
    [5,5,5,6,6,7,7,4],
    [8,8,8,8,9,9,9,9]
  ],
  [
    [0,0,1,1,1,1,2,2],
    [0,3,3,3,4,4,2,2],
    [0,3,5,4,4,6,6,6],
    [7,5,5,5,8,8,9,6],
    [7,7,7,8,8,9,9,9]
  ],
  [
    [0,1,1,1,2,2,2,3],
    [0,0,0,1,4,2,3,3],
    [5,5,6,4,4,4,7,3],
    [5,6,6,6,8,8,7,7],
    [5,9,9,9,9,8,8,7]
  ]
];

const MINO_COLORS = [
  'bg-cyan-500', 'bg-yellow-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500',
  'bg-blue-600', 'bg-orange-500', 'bg-pink-500', 'bg-emerald-500', 'bg-indigo-500'  
];

// --- Components ---

const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ['#FBBF24', '#34D399', '#60A5FA', '#F87171', '#A78BFA'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
};

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

const MessageBox = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[300] bg-black/80 text-white px-10 py-5 rounded-3xl text-xl font-bold shadow-2xl backdrop-blur-md border border-white/10">
      {message}
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState('setup'); 
  const [playerCount, setPlayerCount] = useState(4);
  const [panelConfig, setPanelConfig] = useState(20); 
  const [players, setPlayers] = useState([
    { id: 1, name: 'プレイヤー 1', score: 0 },
    { id: 2, name: 'プレイヤー 2', score: 0 },
    { id: 3, name: 'プレイヤー 3', score: 0 },
    { id: 4, name: 'プレイヤー 4', score: 0 },
  ]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [quizImages, setQuizImages] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [panels, setPanels] = useState([]);
  const [isDoublePoints, setIsDoublePoints] = useState(false);
  
  const [isStageLoading, setIsStageLoading] = useState(false);

  const [editIdx, setEditIdx] = useState(0);
  const [tetrisLayout, setTetrisLayout] = useState([]); 
  const exportCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [feedback, setFeedback] = useState({ type: '', visible: false });
  const [cutIn, setCutIn] = useState({ name: '', visible: false });
  const [msg, setMsg] = useState({ text: '', visible: false });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setPlayers(prev => {
      if (prev.length < playerCount) {
        const diff = playerCount - prev.length;
        const newOnes = Array.from({ length: diff }, (_, i) => ({
          id: prev.length + i + 1,
          name: `プレイヤー ${prev.length + i + 1}`,
          score: 0
        }));
        return [...prev, ...newOnes];
      } else if (prev.length > playerCount) {
        return prev.slice(0, playerCount);
      }
      return prev;
    });
  }, [playerCount]);

  const showAlert = (text) => {
    setMsg({ text, visible: true });
    setTimeout(() => setMsg({ text: '', visible: false }), 2000);
  };

  const shuffleArray = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showAlert("画像ファイルが見つかりません。");
      return;
    }
    const loadedImages = [];
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        loadedImages.push({
          url: event.target.result,
          name: file.name.split('.').slice(0, -1).join('.'),
          settings: { scale: 1, x: 0, y: 0 }
        });
        if (loadedImages.length === imageFiles.length) {
          setQuizImages(shuffleArray([...loadedImages]));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const startGame = () => {
    if (quizImages.length === 0) {
      showAlert("画像を読み込んでください。");
      return;
    }
    setIsStageLoading(true);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    setGameState('playing');
    setCurrentIdx(0);
    setCurrentPlayerIdx(0);
    initPanels(panelConfig);
    
    // 最初はプレイヤー1をセットして表示
    setCutIn({ name: players[0].name, visible: true });
    
    setTimeout(() => {
      setCutIn(prev => ({ ...prev, visible: false }));
      setIsStageLoading(false);
    }, 2000);
  };

  const initPanels = (config) => {
    const dartNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
    const shuffledNums = shuffleArray(dartNumbers);
    if (config === 'tetris') {
      const pattern = TETRIS_PATTERNS[Math.floor(Math.random() * TETRIS_PATTERNS.length)];
      setTetrisLayout(pattern);
      const newPanels = Array.from({ length: 10 }, (_, i) => ({
        id: i, visible: true, assignedNumbers: [], color: MINO_COLORS[i]
      }));
      shuffledNums.forEach((num, index) => {
        const pieceIdx = index % 10;
        newPanels[pieceIdx].assignedNumbers.push(num);
      });
      setPanels(newPanels);
    } else {
      const newPanels = Array.from({ length: config }, (_, i) => ({
        id: i, visible: true, assignedNumbers: [], color: 'bg-indigo-600'
      }));
      shuffledNums.forEach((num, index) => {
        const panelIndex = index % config;
        newPanels[panelIndex].assignedNumbers.push(num);
      });
      setPanels(newPanels);
    }
  };

  const removePanel = (id) => {
    if (isTransitioning || isStageLoading) return;
    setPanels(prev => prev.map(p => p.id === id ? { ...p, visible: false } : p));
  };

  const handleAnswer = (isCorrect) => {
    if (isTransitioning || isStageLoading) return;
    setIsTransitioning(true);
    if (isCorrect) {
      const remainingCount = panels.filter(p => p.visible).length;
      const countForCalc = panelConfig === 'tetris' ? 10 : panelConfig;
      const basePoint = countForCalc === 20 ? 10 : Math.floor(200 / countForCalc);
      let points = remainingCount * basePoint;
      if (isDoublePoints) points *= 2;
      setPlayers(prev => prev.map((p, i) => i === currentPlayerIdx ? { ...p, score: p.score + points } : p));
      setFeedback({ type: 'correct', visible: true });
      setPanels(prev => prev.map(p => ({ ...p, visible: false })));
      setTimeout(() => {
        setFeedback({ type: '', visible: false });
        if (currentIdx + 1 < quizImages.length) { 
          nextTurn(true); 
        } else { 
          setGameState('ended'); 
        }
        setIsTransitioning(false);
      }, 3000);
    } else {
      setFeedback({ type: 'incorrect', visible: true });
      setTimeout(() => {
        setFeedback({ type: '', visible: false });
        nextTurn(false);
        setIsTransitioning(false);
      }, 1500);
    }
  };

  const nextTurn = (isNextQuestion) => {
    const nextPlayerIdx = (currentPlayerIdx + 1) % players.length;
    if (isNextQuestion) {
      setIsStageLoading(true);
      setCurrentIdx(prev => prev + 1);
      initPanels(panelConfig);
      setIsDoublePoints(false);
    }
    
    // 次のプレイヤー名を明示的に指定してカットインを表示
    setCutIn({ name: players[nextPlayerIdx].name, visible: true });
    
    setTimeout(() => {
      setCutIn(prev => ({ ...prev, visible: false }));
      setCurrentPlayerIdx(nextPlayerIdx);
      setIsStageLoading(false);
    }, 2000);
  };

  const updateImageSetting = (idx, newSettings) => {
    setQuizImages(prev => prev.map((img, i) => 
      i === idx ? { ...img, settings: { ...img.settings, ...newSettings } } : img
    ));
  };

  const downloadImage = () => {
    const currentEdit = quizImages[editIdx];
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = currentEdit.url;
    img.onload = () => {
      canvas.width = 1280; canvas.height = 720;
      ctx.fillStyle = "black"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const { scale, x, y } = currentEdit.settings;
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      let baseW, baseH;
      if (imgRatio > canvasRatio) { baseW = canvas.width; baseH = canvas.width / imgRatio; }
      else { baseH = canvas.height; baseW = canvas.height * imgRatio; }
      const scaledW = baseW * scale; const scaledH = baseH * scale;
      const moveX = scaledW * (x / 100); const moveY = scaledH * (y / 100);
      const drawX = (canvas.width - scaledW) / 2 + moveX; const drawY = (canvas.height - scaledH) / 2 + moveY;
      ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
      const link = document.createElement('a');
      link.download = `${currentEdit.name}_edited.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showAlert("加工済み画像を保存しました！");
    };
  };

  const getGridClass = () => {
    if (panelConfig === 'tetris') return 'grid-cols-8 grid-rows-5';
    switch (panelConfig) {
      case 4: return 'grid-cols-2 grid-rows-2';
      case 8: return 'grid-cols-4 grid-rows-2';
      case 10: return 'grid-cols-5 grid-rows-2';
      case 16: return 'grid-cols-4 grid-rows-4';
      default: return 'grid-cols-5 grid-rows-4';
    }
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl border border-slate-100 overflow-y-auto max-h-[95vh]">
          <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900 flex items-center justify-center gap-3 italic">
            <Camera className="w-8 h-8 text-indigo-500" />
            画像当てマスター
          </h1>

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

  if (gameState === 'editing') {
    const currentEdit = quizImages[editIdx];
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
        <div className="flex-1 flex flex-col lg:flex-row p-6 gap-8 items-start justify-center overflow-y-auto">
          <div className="w-full lg:w-2/3 flex flex-col items-center">
             <div className="w-full bg-slate-200 p-2 rounded-[2.5rem] shadow-inner">
               <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <img src={currentEdit.url} className="w-full h-full object-contain" style={{ transform: `scale(${currentEdit.settings.scale}) translate(${currentEdit.settings.x}%, ${currentEdit.settings.y}%)`, transition: 'transform 0.1s ease-out' }} alt="edit" />
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

  if (gameState === 'playing') {
    const currentImg = quizImages[currentIdx];
    const countForCalc = panelConfig === 'tetris' ? 10 : panelConfig;
    const basePoint = countForCalc === 20 ? 10 : Math.floor(200 / countForCalc);
    const currentMaxPoints = panels.filter(p => p.visible).length * basePoint * (isDoublePoints ? 2 : 1);

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
        </div>

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
        {/* 修正：playerName に currentPlayerIdx ではなく、cutIn.name を渡すようにしました */}
        <PlayerCutIn playerName={cutIn.name} visible={cutIn.visible} />
        <MessageBox message={msg.text} visible={msg.visible} />
        <button onClick={() => setGameState('setup')} className="fixed bottom-6 right-6 p-4 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white rounded-full transition-all border border-white/5"><RotateCcw className="w-6 h-6" /></button>
      </div>
    );
  }

  if (gameState === 'ended') {
    const sortedPlayers = [...players].sort((a,b) => b.score - a.score);
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
                <div className="text-right"><span className="text-4xl font-black text-indigo-600 font-mono leading-none">{p.score}</span><p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1">ポイント</p></div>
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('setup')} className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all active:scale-95 uppercase tracking-widest">タイトルへ戻る</button>
        </div>
      </div>
    );
  }
}