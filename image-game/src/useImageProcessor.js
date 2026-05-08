import { useState, useRef } from 'react';
import { shuffleArray } from './arrayUtils';

export const useImageProcessor = (quizImages, setQuizImages, showAlert) => {
  const [editIdx, setEditIdx] = useState(0); // 現在編集中の画像のインデックス
  const exportCanvasRef = useRef(null); // 画像エクスポート用Canvas
  const fileInputRef = useRef(null); // ファイル選択用input

  // フォルダ選択時の処理
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
        const pathParts = file.webkitRelativePath.split('/');
        // ルート/ジャンル/点数/ファイル名 の構造を想定
        const genre = (pathParts.length >= 4 ? pathParts[1] : 'その他') || 'その他';
        const pointStr = (pathParts.length >= 4 ? pathParts[2] : '0') || '0';
        const pointValue = parseInt(pointStr.replace(/[^0-9]/g, '')) || 0;

        loadedImages.push({
          url: event.target.result,
          name: file.name.split('.').slice(0, -1).join('.'),
          genre: genre,
          pointValue: pointValue,
          isPlayed: false,
          settings: { scale: 1, x: 0, y: 0 }
        });
        if (loadedImages.length === imageFiles.length) {
          setQuizImages(shuffleArray([...loadedImages]));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 画像の加工設定を更新
  const updateImageSetting = (idx, newSettings) => {
    setQuizImages(prev => prev.map((img, i) =>
      i === idx ? { ...img, settings: { ...img.settings, ...newSettings } } : img
    ));
  };

  // 加工済み画像をダウンロード
  const downloadImage = () => {
    const currentEdit = quizImages[editIdx];
    const canvas = exportCanvasRef.current;
    if (!canvas || !currentEdit) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = currentEdit.url;
    img.onload = () => {
      canvas.width = 1280; canvas.height = 720; // 固定サイズでエクスポート
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

  return { editIdx, setEditIdx, fileInputRef, exportCanvasRef, handleFolderSelect, updateImageSetting, downloadImage };
};