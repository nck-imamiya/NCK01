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
        const img = new Image();
        img.onload = () => {
          const pathParts = file.webkitRelativePath.split('/');
          const genre = (pathParts.length >= 4 ? pathParts[1] : 'その他') || 'その他';
          const pointStr = (pathParts.length >= 4 ? pathParts[2] : '0') || '0';
          const pointValue = parseInt(pointStr.replace(/[^0-9]/g, '')) || 0;

          loadedImages.push({
            url: event.target.result,
            name: file.name.split('.').slice(0, -1).join('.'),
            genre: genre,
            pointValue: pointValue,
            isPlayed: false,
            settings: { scale: 1, x: 0, y: 0, isPortrait: img.height > img.width }
          });
          if (loadedImages.length === imageFiles.length) {
            setQuizImages(shuffleArray([...loadedImages]));
          }
        };
        img.src = event.target.result;
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
      const isPortrait = currentEdit.settings.isPortrait;
      canvas.width = isPortrait ? 720 : 1280;
      canvas.height = isPortrait ? 1280 : 720;
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;

      ctx.fillStyle = "black"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 背景のぼかしを描画 (プレビューと合わせる)
      ctx.save();
      ctx.filter = 'blur(40px) brightness(0.8)';
      ctx.globalAlpha = 0.4;
      // 背景はCover形式で描画
      let bgW, bgH;
      if (imgRatio > canvasRatio) { bgH = canvas.height; bgW = canvas.height * imgRatio; }
      else { bgW = canvas.width; bgH = canvas.width / imgRatio; }
      ctx.drawImage(img, (canvas.width - bgW * 1.1) / 2, (canvas.height - bgH * 1.1) / 2, bgW * 1.1, bgH * 1.1);
      ctx.restore();
      ctx.globalAlpha = 1.0;

      const { scale, x, y } = currentEdit.settings;
      let baseW, baseH;
      // Containロジックに変更 (画像全体を収める)
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