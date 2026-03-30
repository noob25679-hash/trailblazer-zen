import { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

export default function CameraScreen() {
  const { setScreen, showToast } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch {
      setError('Camera access denied or unavailable');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, startCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhoto(dataUrl);
    showToast('📸 Photo captured!');
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const downloadPhoto = () => {
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo;
    a.download = `trekr_${Date.now()}.jpg`;
    a.click();
    showToast('💾 Photo saved!');
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-[52px] pb-3 flex justify-between items-center"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
        <button onClick={() => setScreen('feed')}
          className="bg-background/60 backdrop-blur-xl border border-border rounded-full px-4 py-2 text-foreground font-mono text-[11px] tracking-[1px] cursor-pointer">
          ← Back
        </button>
        <div className="font-display text-[20px] text-white tracking-[2px]">CAMERA</div>
        <button onClick={flipCamera}
          className="bg-background/60 backdrop-blur-xl border border-border rounded-full w-10 h-10 flex items-center justify-center text-[18px] cursor-pointer">
          🔄
        </button>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-[64px] mb-4">📷</div>
          <div className="font-display text-[22px] text-foreground mb-2">Camera Unavailable</div>
          <div className="text-[13px] text-muted-foreground mb-6">{error}</div>
          <button onClick={() => startCamera(facingMode)}
            className="font-mono text-[11px] tracking-[1.5px] uppercase px-6 py-3 rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer">
            Retry
          </button>
        </div>
      ) : photo ? (
        <>
          <img src={photo} alt="Captured" className="flex-1 object-contain" />
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-[calc(72px+env(safe-area-inset-bottom,0px)+16px)] pt-4 flex justify-center gap-4"
            style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
            <button onClick={() => setPhoto(null)}
              className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 text-white font-mono text-[11px] tracking-[1px] cursor-pointer">
              Retake
            </button>
            <button onClick={downloadPhoto}
              className="bg-gradient-to-br from-primary to-green-dark border-none rounded-full px-6 py-3 text-white font-mono text-[11px] tracking-[1px] cursor-pointer shadow-[0_4px_20px_rgba(34,197,94,0.4)]">
              💾 Save
            </button>
          </div>
        </>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-[calc(72px+env(safe-area-inset-bottom,0px)+16px)] pt-4 flex justify-center"
            style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
            <button onClick={capture}
              className="w-[72px] h-[72px] rounded-full border-4 border-white bg-white/20 cursor-pointer active:scale-90 transition-transform flex items-center justify-center">
              <div className="w-[56px] h-[56px] rounded-full bg-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
