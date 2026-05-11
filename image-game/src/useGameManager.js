import { useState, useEffect, useMemo } from 'react';
import { TETRIS_PATTERNS, MINO_COLORS } from './gameConstants';
import { shuffleArray } from './arrayUtils';

export const useGameManager = (quizImages, setQuizImages) => {
  const [gameState, setGameState] = useState('setup');
  const [gameMode, setGameMode] = useState('standard'); // 'standard' or 'category'
  const [playerCount, setPlayerCount] = useState(4);
  const [panelConfig, setPanelConfig] = useState(20);
  const [players, setPlayers] = useState([
    { id: 1, name: 'プレイヤー 1', score: 0 },
    { id: 2, name: 'プレイヤー 2', score: 0 },
    { id: 3, name: 'プレイヤー 3', score: 0 },
    { id: 4, name: 'プレイヤー 4', score: 0 },
  ]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0); // 現在のクイズ画像のインデックス
  const [panels, setPanels] = useState([]); // パネルの状態
  // const [isDoublePoints, setIsDoublePoints] = useState(false); // ポイント2倍フラグ (一時停止)
  const [isStageLoading, setIsStageLoading] = useState(false); // ステージ切り替え中のローディング
  const [tetrisLayout, setTetrisLayout] = useState([]); // テトリスモードのレイアウト

  // UIフィードバックとメッセージ
  const [feedback, setFeedback] = useState({ type: '', visible: false });
  const [cutIn, setCutIn] = useState({ name: '', visible: false });
  const [msg, setMsg] = useState({ text: '', visible: false });
  const [scoringInfo, setScoringInfo] = useState(null); // { playerIdx, startScore, addedPoints }
  const [isTransitioning, setIsTransitioning] = useState(false); // 画面遷移中のフラグ
  const [pendingJudge, setPendingJudge] = useState(null); // 'correct' or 'incorrect'
  const [isJudging, setIsJudging] = useState(false);
  const [isCorrectAndWaiting, setIsCorrectAndWaiting] = useState(false); // 正解後の待機状態

  // パネル設定に基づいた基本ポイントをメモ化
  const basePoint = useMemo(() => {
    const countForCalc = panelConfig === 'tetris' ? 10 : panelConfig;
    return countForCalc === 20 ? 10 : Math.floor(200 / countForCalc);
  }, [panelConfig]);

  // プレイヤー人数の変更を監視し、プレイヤーリストを調整
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

  // メッセージ表示
  const showAlert = (text) => {
    setMsg({ text, visible: true });
    setTimeout(() => setMsg({ text: '', visible: false }), 2000);
  };

  // 共通の開始処理
  const executeGameStart = () => {
    setIsStageLoading(true);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 }))); // スコアをリセット
    setCurrentPlayerIdx(0);

    if (gameMode === 'category') {
      setGameState('category_select');
    } else {
      setGameState('playing');
      setCurrentIdx(0);
      initPanels(panelConfig);
    }

    // 最初はプレイヤー1をセットして表示
    setCutIn({ name: players[0].name, visible: true });

    setTimeout(() => {
      setCutIn(prev => ({ ...prev, visible: false }));
      setIsStageLoading(false);
    }, 2000);
  };

  // 通常のゲーム開始
  const startGame = () => {
    if (quizImages.length === 0) {
      showAlert("画像を読み込んでください。");
      return;
    }
    executeGameStart();
  };

  // テストモードで開始
  const startTestGame = () => {
    const mock = [
      { url: 'https://placehold.jp/44/4f46e5/ffffff/1280x720.png?text=TEST%20QUESTION%201', name: 'テスト1', genre: 'テスト', pointValue: 100, isPlayed: false, settings: { scale: 1, x: 0, y: 0 } },
      { url: 'https://placehold.jp/44/10b981/ffffff/1280x720.png?text=TEST%20QUESTION%202', name: 'テスト2', genre: 'テスト', pointValue: 200, isPlayed: false, settings: { scale: 1, x: 0, y: 0 } },
      { url: 'https://placehold.jp/44/f59e0b/ffffff/1280x720.png?text=TEST%20QUESTION%203', name: 'テスト3', genre: 'テスト', pointValue: 300, isPlayed: false, settings: { scale: 1, x: 0, y: 0 } }
    ];
    setQuizImages(mock);
    executeGameStart();
  };

  // パネルの初期化
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

  // パネルを非表示にする
  const removePanel = (id) => {
    if (isTransitioning || isStageLoading || isJudging) return;
    setPanels(prev => prev.map(p => p.id === id ? { ...p, visible: false } : p));
  };

  // 回答処理
  const handleAnswer = (isCorrect) => {
    if (isTransitioning || isStageLoading) return;
    setIsTransitioning(true);
    const currentImg = quizImages[currentIdx];

    if (isCorrect) {
      let points = 0;
      if (gameMode === 'category') {
        points = currentImg.pointValue;
      } else {
        const remainingCount = panels.filter(p => p.visible).length;
        points = remainingCount * basePoint;
        // if (isDoublePoints) points *= 2;
      }

      const prevScore = players[currentPlayerIdx].score;
      
      setFeedback({ type: 'correct', visible: true });
      setPanels(prev => prev.map(p => ({ ...p, visible: false }))); // 全パネルを非表示

      // まず「正解！」を単独で表示し、その後にスコアカードを表示する
      setTimeout(() => {
        setFeedback({ type: '', visible: false });
        setScoringInfo({ playerIdx: currentPlayerIdx, startScore: prevScore, addedPoints: points });
      }, 1200);

      setTimeout(() => {
        setPlayers(prev => prev.map((p, i) => i === currentPlayerIdx ? { ...p, score: p.score + points } : p));
        setScoringInfo(null);
        setIsCorrectAndWaiting(true); // 待機状態へ
        setIsTransitioning(false);
      }, 4500); // 合計演出時間（1.2s + 3.3s）
    } else {
      setFeedback({ type: 'incorrect', visible: true });
      setTimeout(() => {
        setFeedback({ type: '', visible: false });
        nextTurn(false); // 次のプレイヤーへ
        setIsTransitioning(false);
      }, 1500);
    }
  };

  // ジャッジ開始演出
  const startJudging = () => {
    if (!pendingJudge || isJudging || isTransitioning || isStageLoading) return;
    setIsJudging(true);
    setIsTransitioning(true); // 演出中の操作防止
    setTimeout(() => {
      setIsJudging(false);
      setIsTransitioning(false); // handleAnswer内部のガードを通すため一旦解除
      handleAnswer(pendingJudge === 'correct');
      setPendingJudge(null);
    }, 2500); // 移動時間(0.5s) + 判定演出(2.0s)
  };

  // カテゴリーモードでクイズを選択
  const selectCategoryQuiz = (idx) => {
    setIsStageLoading(true);
    setCurrentIdx(idx);
    initPanels(panelConfig);
    setGameState('playing');
    setTimeout(() => setIsStageLoading(false), 500);
  };

  // 正解待機状態から次へ進む処理
  const proceedToNext = () => {
    setIsCorrectAndWaiting(false);
    
    if (gameMode === 'category') {
      const nextImages = quizImages.map((img, i) => i === currentIdx ? { ...img, isPlayed: true } : img);
      setQuizImages(nextImages);
      
      if (nextImages.every(img => img.isPlayed)) {
        setGameState('ended');
      } else {
        setGameState('category_select');
      }
      nextTurn(false);
    } else if (currentIdx + 1 < quizImages.length) {
      nextTurn(true);
    } else {
      setGameState('ended');
    }
    setIsTransitioning(false);
  };

  // ターンを進める
  const nextTurn = (isNextQuestion) => {
    const nextPlayerIdx = (currentPlayerIdx + 1) % players.length;
    if (isNextQuestion) {
      setIsStageLoading(true);
      setCurrentIdx(prev => prev + 1);
      initPanels(panelConfig);
      // setIsDoublePoints(false);
    }

    // 次のプレイヤー名を明示的に指定してカットインを表示
    setCutIn({ name: players[nextPlayerIdx].name, visible: true });

    setTimeout(() => {
      setCutIn(prev => ({ ...prev, visible: false }));
      setCurrentPlayerIdx(nextPlayerIdx);
      setIsStageLoading(false);
    }, 2000);
  };

  // パネルのグリッドクラスを返す
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

  return {
    gameState, setGameState,
    gameMode, setGameMode,
    playerCount, setPlayerCount,
    panelConfig, setPanelConfig,
    players, setPlayers,
    currentPlayerIdx, setCurrentPlayerIdx,
    currentIdx, setCurrentIdx,
    panels, setPanels, removePanel,
    // isDoublePoints, setIsDoublePoints,
    isStageLoading, setIsStageLoading,
    tetrisLayout, setTetrisLayout,
    feedback, setFeedback,
    cutIn, setCutIn,
    msg, showAlert,
    scoringInfo, setScoringInfo,
    isTransitioning, setIsTransitioning,
    pendingJudge, setPendingJudge,
    isJudging, setIsJudging,
    isCorrectAndWaiting,
    basePoint,
    startGame,
    startJudging,
    proceedToNext,
    startTestGame,
    initPanels,
    handleAnswer,
    nextTurn,
    getGridClass,
    selectCategoryQuiz,
  };
};