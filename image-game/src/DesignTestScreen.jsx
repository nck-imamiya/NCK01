import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Users, Grid, Scissors, Puzzle, Layers, FlaskConical, Palette, Layout, Sparkles, Zap } from 'lucide-react';

// デザインテーマの定義
const THEMES = {
  glass: {
    name: 'Standard Glass',
    container: 'bg-slate-50',
    card: 'bg-white/80 backdrop-blur-md border-white border-2 shadow-xl rounded-[2.5rem]',
    buttonPrimary: 'bg-indigo-600 text-white',
    buttonSecondary: 'bg-white/80 backdrop-blur-md border-indigo-600 text-indigo-600',
    textMain: 'text-indigo-900',
    textSub: 'text-slate-400',
    accent: 'indigo'
  },
  neon: {
    name: 'Midnight Neon',
    container: 'bg-slate-950',
    card: 'bg-slate-900/50 border-indigo-500/50 border shadow-[0_0_30px_rgba(79,70,229,0.2)] rounded-[1.5rem] backdrop-blur-lg',
    buttonPrimary: 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:shadow-[0_0_30px_rgba(99,102,241,0.8)]',
    buttonSecondary: 'bg-transparent border border-indigo-400 text-indigo-400',
    textMain: 'text-white',
    textSub: 'text-indigo-300/60',
    accent: 'cyan'
  },
  kawaii: {
    name: 'Pastel Kawaii',
    container: 'bg-pink-50',
    card: 'bg-white border-4 border-pink-200 shadow-[8px_8px_0px_#fbcfe8] rounded-[3rem]',
    buttonPrimary: 'bg-pink-400 text-white rounded-[2rem] hover:scale-105 active:scale-95',
    buttonSecondary: 'bg-yellow-100 border-2 border-yellow-300 text-yellow-700 rounded-[2rem]',
    textMain: 'text-pink-600',
    textSub: 'text-pink-300',
    accent: 'pink'
  },
  cyber: {
    name: 'Cyber Grid',
    container: 'bg-zinc-900',
    card: 'bg-black border-l-8 border-yellow-400 shadow-[10px_10px_0px_rgba(250,204,21,0.1)] rounded-none p-8',
    buttonPrimary: 'bg-yellow-400 text-black font-black skew-x-[-12deg] hover:skew-x-0 transition-transform',
    buttonSecondary: 'bg-zinc-800 text-yellow-400 border border-yellow-400/30 font-bold',
    textMain: 'text-yellow-400',
    textSub: 'text-zinc-500',
    accent: 'yellow'
  }
};

export default function DesignTestScreen({ setGameState }) {
  const [currentThemeKey, setCurrentThemeKey] = useState('glass');
  const theme = THEMES[currentThemeKey];

  return (
    <div className={`min-h-screen ${theme.container} transition-colors duration-500 p-6 md:p-12 overflow-y-auto font-sans`}>
      
      {/* テスト用コントロールパネル */}
      <div className="fixed top-4 right-4 z-[100] bg-white/90 backdrop-blur shadow-2xl p-2 rounded-2xl flex flex-col gap-2 border border-slate-200">
        <p className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-widest">Layout Switcher</p>
        {Object.keys(THEMES).map(key => (
          <button
            key={key}
            onClick={() => setCurrentThemeKey(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentThemeKey === key ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {key === 'glass' && <Layout className="w-3 h-3" />}
            {key === 'neon' && <Zap className="w-3 h-3" />}
            {key === 'kawaii' && <Sparkles className="w-3 h-3" />}
            {key === 'cyber' && <Palette className="w-3 h-3" />}
            {THEMES[key].name}
          </button>
        ))}
        <div className="h-px bg-slate-100 my-1" />
        <button onClick={() => setGameState('setup')} className="text-[10px] font-bold text-rose-500 p-2 hover:bg-rose-50 rounded-lg">セットアップに戻る</button>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.header 
          key={`header-${currentThemeKey}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-16"
        >
          <h1 className={`text-5xl font-black ${theme.textMain} flex items-center gap-4 italic mb-2 tracking-tighter uppercase`}>
            <Camera className={`w-12 h-12 ${currentThemeKey === 'kawaii' ? 'text-pink-400' : 'text-indigo-500'}`} />
            {currentThemeKey === 'kawaii' ? 'ぴたっと！パネルん' : 'VISION PIERCE'}
          </h1>
          <p className={`${theme.textSub} font-bold uppercase tracking-[0.3em] text-xs`}>Design Prototype Mode: {theme.name}</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* 左カラム */}
          <div className="lg:col-span-7 space-y-12">
            <motion.section 
              key={`s1-${currentThemeKey}`}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className={`${theme.card} p-8`}
            >
              <p className={`${theme.textSub} font-black text-xs uppercase tracking-widest mb-6 border-b border-current pb-2 opacity-50`}>01. Select Mode</p>
              <div className="grid grid-cols-2 gap-6">
                <div className={`p-8 rounded-[2rem] border-2 bg-indigo-600 text-white flex flex-col items-start gap-4 shadow-xl`}>
                  <Grid className="w-6 h-6" />
                  <span className="text-lg font-black tracking-tight">Standard</span>
                </div>
                <div className={`p-8 rounded-[2rem] border-2 border-dashed opacity-50 flex flex-col items-start gap-4 ${theme.textSub}`}>
                  <Layers className="w-6 h-6" />
                  <span className="text-lg font-black tracking-tight">Category</span>
                </div>
              </div>
            </motion.section>

            <div className="grid grid-cols-2 gap-12">
              <motion.section 
                key={`s2-${currentThemeKey}`}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`${theme.card} p-6`}
              >
                <p className={`${theme.textSub} font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2`}><Users className="w-3 h-3" /> Players</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${num === 4 ? theme.buttonPrimary : 'bg-slate-200 text-slate-400 opacity-30'}`}>{num}</div>
                  ))}
                </div>
              </motion.section>

              <motion.section 
                key={`s3-${currentThemeKey}`}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`${theme.card} p-6`}
              >
                <p className={`${theme.textSub} font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2`}><Grid className="w-3 h-3" /> Panels</p>
                <div className="flex gap-2">
                  {['16', '20', 'TETRIS'].map(num => (
                    <div key={num} className={`px-3 py-2 rounded-xl text-[10px] font-black ${num === '20' ? theme.buttonPrimary : 'bg-slate-200 text-slate-400 opacity-30'}`}>{num}</div>
                  ))}
                </div>
              </motion.section>
            </div>

            <motion.section 
              key={`s4-${currentThemeKey}`}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`${theme.card} p-8 border-dashed border-4 flex flex-col items-center gap-4 opacity-70`}
            >
              <Camera className={`w-8 h-8 ${theme.textMain}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${theme.textMain}`}>Mock Image Upload Zone</span>
            </motion.section>
          </div>

          {/* 右カラム */}
          <div className="lg:col-span-5 space-y-12">
            <motion.section 
              key={`s5-${currentThemeKey}`}
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className={`${theme.card} p-8`}
            >
              <p className={`${theme.textSub} font-black text-xs uppercase tracking-widest mb-6 border-b border-current pb-2 opacity-50`}>03. Players</p>
              <div className="space-y-3">
                {['Alice', 'Bob', 'Charlie', 'Dave'].map((name, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border ${currentThemeKey === 'glass' ? 'bg-white' : 'bg-white/5'} border-current/10`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${theme.buttonPrimary}`}>{i + 1}</span>
                    <span className={`font-bold ${theme.textMain}`}>{name}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.div 
              key={`s6-${currentThemeKey}`}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <button className={`w-full py-6 rounded-[2rem] font-black text-lg shadow-xl transition-all ${theme.buttonSecondary}`}>
                <Scissors className="w-5 h-5 inline mr-2" /> Mock Editing
              </button>
              <button className={`w-full py-8 rounded-[2rem] font-black text-2xl shadow-2xl transition-all uppercase italic tracking-tighter ${theme.buttonPrimary}`}>
                Start Game
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* デザイン説明 */}
      <motion.div 
        key={`desc-${currentThemeKey}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto mt-20 p-8 border-t border-current/10 opacity-50"
      >
        <h4 className={`text-sm font-black uppercase mb-4 ${theme.textMain}`}>Design Concept: {theme.name}</h4>
        <p className={`text-xs leading-relaxed ${theme.textSub}`}>
          {currentThemeKey === 'glass' && '現在の主流デザイン。Apple製品のような透明感と清潔感があり、どんな画像背景にも馴染みます。'}
          {currentThemeKey === 'neon' && 'ゲームセンターやeスポーツを意識したデザイン。暗い部屋でのプレイで没入感を高め、光の演出が際立ちます。'}
          {currentThemeKey === 'kawaii' && 'パーティーや家族でのプレイを意識。柔らかい丸みと太い境界線、パステルカラーで「楽しさ」と「安心感」を与えます。'}
          {currentThemeKey === 'cyber' && 'エッジの効いた近未来デザイン。不規則な形や強いコントラストを使い、競技性の高い「ガチ」な雰囲気を作ります。'}
        </p>
      </motion.div>
    </div>
  );
}