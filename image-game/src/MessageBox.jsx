import React from 'react';

const MessageBox = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[300] bg-black/80 text-white px-10 py-5 rounded-3xl text-xl font-bold shadow-2xl backdrop-blur-md border border-white/10">
      {message}
    </div>
  );
};

export default MessageBox;