import React, { useState } from 'react';
import { useGameManager } from './useGameManager';
import { useImageProcessor } from './useImageProcessor';
import SetupScreen from './SetupScreen';
import EditingScreen from './EditingScreen';
import PlayingScreen from './PlayingScreen';
import ResultScreen from './ResultScreen';
import CategorySelectScreen from './CategorySelectScreen';
import MessageBox from './MessageBox';

export default function App() {
  const [quizImages, setQuizImages] = useState([]); // 全ての画面で共有される画像データ

  // ゲーム管理ロジックをカスタムフックから取得
  const {
    gameState, setGameState,
    gameMode, setGameMode,
    playerCount, setPlayerCount,
    panelConfig, setPanelConfig,
    players, setPlayers,
    currentPlayerIdx,
    currentIdx,
    panels, removePanel,
    isDoublePoints, setIsDoublePoints,
    isStageLoading,
    tetrisLayout,
    feedback, cutIn, msg, showAlert,
    basePoint,
    startGame,
    startTestGame,
    handleAnswer,
    getGridClass,
    selectCategoryQuiz,
  } = useGameManager(quizImages, setQuizImages);

  // 画像加工ロジックをカスタムフックから取得
  const {
    editIdx, setEditIdx,
    fileInputRef, exportCanvasRef,
    handleFolderSelect,
    updateImageSetting,
    downloadImage,
  } = useImageProcessor(quizImages, setQuizImages, showAlert);

  if (gameState === 'setup') {
    return (
      <SetupScreen
        gameMode={gameMode} setGameMode={setGameMode}
        playerCount={playerCount} setPlayerCount={setPlayerCount}
        panelConfig={panelConfig} setPanelConfig={setPanelConfig}
        players={players} setPlayers={setPlayers}
        quizImages={quizImages}
        handleFolderSelect={handleFolderSelect} fileInputRef={fileInputRef}
        startGame={startGame}
        startTestGame={startTestGame}
        setGameState={setGameState}
        msg={msg}
      />
    );
  }

  if (gameState === 'category_select') {
    return (
      <CategorySelectScreen
        quizImages={quizImages}
        players={players}
        currentPlayerIdx={currentPlayerIdx}
        selectCategoryQuiz={selectCategoryQuiz}
        setGameState={setGameState}
      />
    );
  }

  if (gameState === 'editing') {
    return (
      <EditingScreen
        quizImages={quizImages}
        editIdx={editIdx} setEditIdx={setEditIdx}
        updateImageSetting={updateImageSetting}
        downloadImage={downloadImage}
        exportCanvasRef={exportCanvasRef}
        setGameState={setGameState}
        startGame={startGame}
        msg={msg}
      />
    );
  }

  if (gameState === 'playing') {
    return (
      <PlayingScreen
        quizImages={quizImages} currentIdx={currentIdx}
        players={players} currentPlayerIdx={currentPlayerIdx}
        panels={panels} removePanel={removePanel}
        isDoublePoints={isDoublePoints} setIsDoublePoints={setIsDoublePoints}
        handleAnswer={handleAnswer}
        basePoint={basePoint} getGridClass={getGridClass}
        isStageLoading={isStageLoading}
        tetrisLayout={tetrisLayout}
        feedback={feedback} cutIn={cutIn} msg={msg}
        setGameState={setGameState}
        panelConfig={panelConfig}
        gameMode={gameMode}
      />
    );
  }

  if (gameState === 'ended') {
    return (
      <ResultScreen
        players={players}
        setGameState={setGameState}
      />
    );
  }
}
