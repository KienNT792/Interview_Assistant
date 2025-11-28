import React from 'react';

interface AIAvatarProps {
  isConnected: boolean;
  volume: number;
  isMicOn: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ isConnected, volume, isMicOn }) => {
  return (
    <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
      {/* AI Avatar Representation */}
      <div className="relative z-10">
        <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${isConnected ? 'bg-blue-600/20' : 'bg-slate-700/50'}`}>
          <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-lg flex items-center justify-center animate-pulse`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
        {/* Ripples when speaking */}
        {isConnected && (
          <>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border border-blue-400/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute top-4 left-4 w-32 h-32 rounded-full border border-cyan-400/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
          </>
        )}
      </div>

      <div className="mt-12 text-center z-10">
        <p className="text-slate-300 text-lg font-light tracking-wide">
          {isConnected ? "AI đang lắng nghe... (Hãy nói 'Xin chào' để bắt đầu)" : "Đang thiết lập kết nối..."}
        </p>
      </div>

      {/* User Audio Visualizer (Simple Volume Bar) */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 h-12 items-end px-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="w-2 bg-emerald-400 rounded-t-sm opacity-80 transition-all duration-75"
            style={{ 
              height: `${Math.max(4, volume * 300 * (Math.random() * 0.5 + 0.5))}px`,
              opacity: isMicOn ? 1 : 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
};
