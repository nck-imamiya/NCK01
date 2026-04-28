import { useState, useEffect, useMemo } from 'react';
import { TETRIS_PATTERNS, MINO_COLORS } from './gameConstants';
import { shuffleArray } from './arrayUtils';

export const useGameManager = (quizImages, setQuizImages) => {
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
  const [currentIdx, setCurrentIdx] = useState(0); // 現在のクイズ画像のインデックス
  const [panels, setPanels] = useState([]); // パネルの状態
  const [isDoublePoints, setIsDoublePoints] = useState(false); // ポイント2倍フラグ
  const [isStageLoading, setIsStageLoading] = useState(false); // ステージ切り替え中のローディング
  const [tetrisLayout, setTetrisLayout] = useState([]); // テトリスモードのレイアウト

  // UIフィードバックとメッセージ
  const [feedback, setFeedback] = useState({ type: '', visible: false });
  const [cutIn, setCutIn] = useState({ name: '', visible: false });
  const [msg, setMsg] = useState({ text: '', visible: false });
  const [isTransitioning, setIsTransitioning] = useState(false); // 画面遷移中のフラグ

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

  // ゲーム開始
  const startGame = () => {
    if (quizImages.length === 0) {
      showAlert("画像を読み込んでください。");
      return;
    }
    setIsStageLoading(true);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 }))); // スコアをリセット
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
    if (isTransitioning || isStageLoading) return;
    setPanels(prev => prev.map(p => p.id === id ? { ...p, visible: false } : p));
  };

  // 回答処理
  const handleAnswer = (isCorrect) => {
    if (isTransitioning || isStageLoading) return;
    setIsTransitioning(true);
    if (isCorrect) {
      const remainingCount = panels.filter(p => p.visible).length;
      let points = remainingCount * basePoint;
      if (isDoublePoints) points *= 2;
      setPlayers(prev => prev.map((p, i) => i === currentPlayerIdx ? { ...p, score: p.score + points } : p));
      setFeedback({ type: 'correct', visible: true });
      setPanels(prev => prev.map(p => ({ ...p, visible: false }))); // 全パネルを非表示
      setTimeout(() => {
        setFeedback({ type: '', visible: false });
        if (currentIdx + 1 < quizImages.length) {
          nextTurn(true); // 次の問題へ
        } else {
          setGameState('ended'); // ゲーム終了
        }
        setIsTransitioning(false);
      }, 3000);
    } else {
      setFeedback({ type: 'incorrect', visible: true });
      setTimeout(() => {
        setFeedback({ type: '', visible: false });
        nextTurn(false); // 次のプレイヤーへ
        setIsTransitioning(false);
      }, 1500);
    }
  };

  // ターンを進める
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
    playerCount, setPlayerCount,
    panelConfig, setPanelConfig,
    players, setPlayers,
    currentPlayerIdx, setCurrentPlayerIdx,
    currentIdx, setCurrentIdx,
    panels, setPanels, removePanel,
    isDoublePoints, setIsDoublePoints,
    isStageLoading, setIsStageLoading,
    tetrisLayout, setTetrisLayout,
    feedback, setFeedback,
    cutIn, setCutIn,
    msg, showAlert,
    isTransitioning, setIsTransitioning,
    basePoint,
    startGame,
    initPanels,
    handleAnswer,
    nextTurn,
    getGridClass,
  };
};