import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Sparkles, ShieldCheck } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const CallModal: React.FC = () => {
  const { activeCall, endCall } = useSocial();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!activeCall?.isVideo);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!activeCall) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall]);

  if (!activeCall) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const name = activeCall.isGroup ? 'Sphere Group Call' : activeCall.user?.name || 'Contact';
  const avatar = activeCall.isGroup 
    ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300' 
    : activeCall.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center flex flex-col items-center justify-between min-h-[480px]">
        
        {/* Call Header */}
        <div className="w-full flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[#00D68F] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span>Encrypted Sphere Call</span>
          </div>
          <span className="font-mono bg-[#F7F9FC] border border-slate-200 px-2.5 py-1 rounded-full text-slate-700 font-semibold">
            {formatTime(callDuration)}
          </span>
        </div>

        {/* User Visual & Waveform */}
        <div className="my-8 flex flex-col items-center">
          <div className="relative">
            {/* Animated Audio Wave Rings */}
            <div className="absolute inset-0 -m-4 rounded-full border-2 border-[#FF3D71]/30 animate-ping opacity-75" />
            <div className="absolute inset-0 -m-8 rounded-full border border-[#3366FF]/20 animate-pulse" />
            
            <img
              src={avatar}
              alt={name}
              className="w-28 h-28 rounded-full object-cover border-4 border-[#FF3D71] shadow-2xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-5 flex items-center gap-1.5">
            {name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Connected on Sphere HD Audio</p>

          {/* Dynamic Audio Visualizer Bars */}
          <div className="flex items-center gap-1.5 mt-6 h-8">
            {[40, 70, 90, 60, 100, 75, 45, 85, 95, 50, 70, 30].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-[#FF3D71] to-[#3366FF] rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all cursor-pointer ${
              isMuted ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FF3D71]/40' : 'bg-[#F7F9FC] hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-all cursor-pointer ${
              isVideoOff ? 'bg-[#F7F9FC] hover:bg-slate-100 text-slate-400 border border-slate-200' : 'bg-[#3366FF] text-white shadow-xs'
            }`}
            title={isVideoOff ? 'Turn on video' : 'Turn off video'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-[#FF3D71] hover:bg-[#e03161] text-white shadow-lg shadow-[#FF3D71]/30 transition-transform hover:scale-105 cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
