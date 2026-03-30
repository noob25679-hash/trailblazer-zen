import { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

type InsightTab = 'insects' | 'plants' | 'peaks';

const CAMERA_INSIGHTS: Record<InsightTab, { title: string; subtitle: string; icon: string; confidence: string }[]> = {
  insects: [
    { title: 'Common Jezebel', subtitle: 'Pollinator butterfly, usually seen near flowering shrubs.', icon: '🦋', confidence: '82%' },
    { title: 'Dragonfly', subtitle: 'Often indicates clean nearby water sources.', icon: '🪰', confidence: '74%' },
  ],
  plants: [
    { title: 'Wild Fern Cluster', subtitle: 'Moisture-rich patch, avoid stepping on young growth.', icon: '🌿', confidence: '79%' },
    { title: 'Karvi Shrub', subtitle: 'Native Western Ghats bloom cycle species.', icon: '🌱', confidence: '71%' },
  ],
  peaks: [
    { title: 'Nearby Ridge Line', subtitle: 'Steep ascent ahead, keep hydration ready.', icon: '⛰️', confidence: '88%' },
    { title: 'Viewpoint Candidate', subtitle: 'Likely clear panorama point if cloud cover opens.', icon: '🌄', confidence: '76%' },
  ],
};

export default function CameraScreen() {
  const { setScreen, showToast } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [activeTab, setActiveTab] = useState<InsightTab>('insects');

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
      streamRef.current?.getTracks().forEach(track => track.stop());
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
    showToast('📸 Frame captured');
  };

  const flipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const downloadPhoto = () => {
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo;
    a.download = `trekr_${Date.now()}.jpg`;
    a.click();
    showToast('💾 Photo saved');
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 z-20 px-4 pb-3 flex justify-between items-center"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          background: 'linear-gradient(180deg, rgba(8,13,8,0.85) 0%, rgba(8,13,8,0.25) 60%, transparent 100%)',
        }}
      >
        <button
          onClick={() => setScreen('feed')}
          className="bg-background/70 backdrop-blur-xl border border-border rounded-full px-3 py-2 text-foreground font-mono text-[10px] tracking-[1px] cursor-pointer"
        >
          ← Back
        </button>

        <div className="text-center">
          <div className="font-display text-[18px] text-foreground tracking-[2px] leading-none">FIELD CAMERA</div>
          <div className="font-mono text-[8px] tracking-[1.5px] text-primary uppercase">Insects · Plants · Peaks</div>
        </div>

        <button
          onClick={flipCamera}
          className="bg-background/70 backdrop-blur-xl border border-border rounded-full w-9 h-9 flex items-center justify-center text-[16px] cursor-pointer"
        >
          🔄
        </button>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-[56px] mb-4">📷</div>
          <div className="font-display text-[22px] text-foreground mb-2">Camera Unavailable</div>
          <div className="text-[13px] text-muted-foreground mb-6">{error}</div>
          <button
            onClick={() => startCamera(facingMode)}
            className="font-mono text-[11px] tracking-[1.5px] uppercase px-6 py-3 rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {photo ? (
            <img src={photo} alt="Captured trail frame" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          )}

          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.58) 100%)' }} />

          <div className="absolute left-3 right-3 z-20" style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 96px)' }}>
            <div className="bg-background/78 backdrop-blur-xl border border-border-bright rounded-2xl p-3 pointer-events-auto">
              <div className="flex gap-2 mb-3">
                {([
                  { key: 'insects', label: 'Insects', icon: '🦋' },
                  { key: 'plants', label: 'Plants', icon: '🌿' },
                  { key: 'peaks', label: 'Peaks', icon: '⛰️' },
                ] as { key: InsightTab; label: string; icon: string }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 rounded-full px-2.5 py-2 font-mono text-[9px] tracking-[1px] uppercase border transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary/15 text-primary border-primary'
                        : 'bg-card text-muted-foreground border-border'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {CAMERA_INSIGHTS[activeTab].map(item => (
                  <div key={item.title} className="bg-card/90 border border-border rounded-xl p-2.5 flex items-start gap-2.5">
                    <div className="text-[20px] leading-none">{item.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-[12px] text-foreground truncate">{item.title}</div>
                        <div className="font-mono text-[9px] text-primary flex-shrink-0">{item.confidence}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{item.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 z-20 pt-4 pb-[calc(72px+env(safe-area-inset-bottom,0px)+14px)] flex justify-center gap-3"
            style={{ background: 'linear-gradient(0deg, rgba(8,13,8,0.9) 0%, rgba(8,13,8,0.2) 65%, transparent 100%)' }}
          >
            {photo ? (
              <>
                <button
                  onClick={() => setPhoto(null)}
                  className="bg-card/90 backdrop-blur-md border border-border-bright rounded-full px-5 py-3 text-foreground font-mono text-[10px] tracking-[1px] cursor-pointer"
                >
                  Retake
                </button>
                <button
                  onClick={downloadPhoto}
                  className="bg-gradient-to-br from-primary to-green-dark border-none rounded-full px-5 py-3 text-white font-mono text-[10px] tracking-[1px] cursor-pointer shadow-[0_4px_20px_rgba(34,197,94,0.4)]"
                >
                  💾 Save
                </button>
              </>
            ) : (
              <button
                onClick={capture}
                className="w-[72px] h-[72px] rounded-full border-4 border-foreground bg-background/20 cursor-pointer active:scale-90 transition-transform flex items-center justify-center"
              >
                <div className="w-[54px] h-[54px] rounded-full bg-foreground" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
