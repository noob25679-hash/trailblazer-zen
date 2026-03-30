import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { haversine } from '@/lib/trails';

export default function SensorsScreen() {
  const { isTracking, trackName, setIsTracking, setTrackName, setScreen, showToast } = useApp();
  const [lat, setLat] = useState('—');
  const [lng, setLng] = useState('—');
  const [elev, setElev] = useState('—');
  const [acc, setAcc] = useState('—');
  const [speed, setSpeed] = useState('0.0');
  const [heading, setHeading] = useState('—');
  const [headingDir, setHeadingDir] = useState('—');
  const [batt, setBatt] = useState('—');
  const [battCharging, setBattCharging] = useState(false);
  const [battLevel, setBattLevel] = useState(0);
  const [time, setTime] = useState('—');
  const [dateStr, setDateStr] = useState('—');
  const [ax, setAx] = useState('0.0');
  const [ay, setAy] = useState('0.0');
  const [az, setAz] = useState('0.0');
  const [online, setOnline] = useState(navigator.onLine);
  const [trackTime, setTrackTime] = useState('00:00:00');
  const [trackDist, setTrackDist] = useState('0.00');
  const [trackPts, setTrackPts] = useState(0);
  const [trackElev, setTrackElev] = useState('—');

  const trackStartRef = useRef<number>(0);
  const trackPointsRef = useRef<[number, number][]>([]);
  const trackDistRef = useRef(0);
  const gpsWatchRef = useRef<number | null>(null);
  const startAltitudeRef = useRef<number | null>(null);
  const [elevGain, setElevGain] = useState('0');

  const degreesToDir = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    return dirs[Math.round(deg / 45) % 8];
  };

  useEffect(() => {
    // GPS
    if (navigator.geolocation) {
      gpsWatchRef.current = navigator.geolocation.watchPosition(
        async pos => {
          const { latitude, longitude, accuracy, speed: s, altitude } = pos.coords;
          setLat(latitude.toFixed(5));
          setLng(longitude.toFixed(5));
          setAcc(Math.round(accuracy).toString());
          setSpeed(s ? (s * 3.6).toFixed(1) : '0.0');
          if (altitude != null) {
            setElev(Math.round(altitude).toString());
            if (isTracking) {
              if (startAltitudeRef.current === null) {
                startAltitudeRef.current = altitude;
              }
              const gain = Math.max(0, Math.round(altitude - startAltitudeRef.current));
              setElevGain(gain.toString());
              setTrackElev(gain.toString());
            }
          }

          if (isTracking && trackPointsRef.current.length > 0) {
            const prev = trackPointsRef.current[trackPointsRef.current.length - 1];
            trackDistRef.current += haversine(prev[0], prev[1], latitude, longitude);
            setTrackDist(trackDistRef.current.toFixed(2));
          }
          if (isTracking) {
            trackPointsRef.current.push([latitude, longitude]);
            setTrackPts(trackPointsRef.current.length);
          }
        },
        () => setLat('DENIED'),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
      );
    }

    // Compass
    const onOrient = (e: DeviceOrientationEvent) => {
      const h = (e as any).webkitCompassHeading ?? (e.alpha ? (360 - e.alpha) : null);
      if (h === null) return;
      const rounded = Math.round(h);
      setHeading(rounded.toString());
      setHeadingDir(degreesToDir(rounded));
    };
    window.addEventListener('deviceorientation', onOrient, true);

    // Accel
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      setAx((a.x || 0).toFixed(1));
      setAy((a.y || 0).toFixed(1));
      setAz((a.z || 0).toFixed(1));
    };
    window.addEventListener('devicemotion', onMotion);

    // Battery
    if ((navigator as any).getBattery) {
      (navigator as any).getBattery().then((b: any) => {
        const update = () => {
          setBatt(`${Math.round(b.level * 100)}%`);
          setBattCharging(b.charging);
          setBattLevel(Math.round(b.level * 100));
        };
        update();
        b.addEventListener('levelchange', update);
        b.addEventListener('chargingchange', update);
      });
    }

    // Clock
    const clockInterval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase());
    }, 1000);

    // Network
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      if (gpsWatchRef.current !== null) navigator.geolocation.clearWatch(gpsWatchRef.current);
      window.removeEventListener('deviceorientation', onOrient, true);
      window.removeEventListener('devicemotion', onMotion);
      clearInterval(clockInterval);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [isTracking]);

  // Track timer
  useEffect(() => {
    if (!isTracking) return;
    trackStartRef.current = Date.now();
    trackPointsRef.current = [];
    trackDistRef.current = 0;
    const interval = setInterval(() => {
      const elapsed = Date.now() - trackStartRef.current;
      const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      setTrackTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking]);

  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      const durMin = Math.round((Date.now() - trackStartRef.current) / 60000);
      showToast(`✅ Trek stopped — ${trackDistRef.current.toFixed(2)}km in ${durMin}min`);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openLogModal', { detail: trackName }));
      }, 400);
    } else {
      window.dispatchEvent(new CustomEvent('openStartTrek'));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-[52px] pb-4 flex justify-between items-end" style={{ background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, transparent 100%)' }}>
        <div>
          <div className="font-mono text-[9px] tracking-[3px] text-primary uppercase">Live Data</div>
          <div className="font-display text-[36px] tracking-[1px] text-foreground leading-none mt-0.5">Sensors</div>
        </div>
        <div className="bg-card border border-border rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-primary animate-pulse-green' : 'bg-text-dim'}`} />
          <span className="font-mono text-[9px] text-muted-foreground">{isTracking ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide pb-20">
        {/* Tracker card */}
        <div className="mx-4 mb-4 bg-card border border-border rounded-[20px] p-5">
          <div className="flex justify-between items-center mb-1">
            <div className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase">Live Trek Tracker</div>
            <div className="font-mono text-[11px] text-primary">{trackTime}</div>
          </div>
          <div className="flex justify-around my-4">
            {[
              { val: trackDist, label: 'KM' },
              { val: trackElev, label: 'Elevation M' },
              { val: speed, label: 'KM/H' },
              { val: trackPts.toString(), label: 'GPS Pts' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[26px] text-primary">{s.val}</div>
                <div className="font-mono text-[8px] text-muted-foreground tracking-[1px] uppercase">{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={toggleTracking}
            className={`w-16 h-16 rounded-full border-none cursor-pointer text-[24px] mx-auto block active:scale-[0.92] transition-transform ${
              isTracking ? 'bg-gradient-to-br from-destructive to-red-800 shadow-[0_0_24px_rgba(239,68,68,0.4)]' : 'bg-gradient-to-br from-primary to-green-dark shadow-[0_0_24px_rgba(34,197,94,0.4)]'
            }`}>{isTracking ? '⏹' : '▶'}</button>
          <div className="text-center font-mono text-[9px] text-text-dim mt-2">
            {isTracking ? `🔴 Recording "${trackName}"` : 'Tap to start tracking'}
          </div>
        </div>

        {/* Sensor grid */}
        <div className="grid grid-cols-2 gap-3 px-4 mb-4">
          <SensorCard icon="📍" value={lat} unit="LATITUDE" sub={lng} subUnit="LONGITUDE" active />
          <SensorCard icon="🏔️" value={elev} unit="METRES" label="Elevation" active />
          <SensorCard icon="🎯" value={acc} unit="METRES ACCURACY" label="GPS Accuracy" />
          <SensorCard icon="💨" value={speed} unit="KM/H" label="Speed" active />
          <SensorCard icon="🔋" value={batt} unit={battCharging ? 'CHARGING ⚡' : 'ON BATTERY'} label="Battery" />
          <SensorCard icon="🧭" value={heading} unit="DEGREES" sub={headingDir} label="Compass" active />
        </div>

        {/* Compass rose */}
        <div className="font-mono text-[11px] tracking-[1.5px] text-muted-foreground uppercase px-4 mb-2.5 font-semibold">Compass</div>
        <div className="flex flex-col items-center px-4 mb-4">
          <div className="w-[180px] h-[180px] rounded-full border-2 border-border-bright bg-card relative flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-[13px] text-destructive">N</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-display text-[13px] text-muted-foreground">S</span>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-display text-[13px] text-muted-foreground">E</span>
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-display text-[13px] text-muted-foreground">W</span>
            <div className="w-1 h-[70px] absolute top-5 left-1/2 origin-bottom rounded-sm transition-transform duration-[400ms]"
              style={{ transform: `translateX(-50%) rotate(${heading === '—' ? 0 : parseInt(heading)}deg)`, background: 'linear-gradient(180deg, hsl(var(--destructive)) 50%, hsl(var(--green-muted)) 50%)' }} />
            <div className="w-3 h-3 rounded-full bg-primary z-10" />
          </div>
          <div className="font-display text-[22px] text-foreground mt-2.5">{heading === '—' ? '—' : heading}°</div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-[1px]">{headingDir === '—' ? 'CALIBRATING' : headingDir}</div>
        </div>

        {/* Network */}
        <div className="font-mono text-[11px] tracking-[1.5px] text-muted-foreground uppercase px-4 mb-2.5 font-semibold">Network & Device</div>
        <div className="grid grid-cols-2 gap-3 px-4 mb-20">
          <SensorCard icon="📶" value={online ? '✅ ONLINE' : '❌ OFFLINE'} unit={online ? 'CONNECTED' : 'NO SIGNAL'} small />
          <SensorCard icon="🌅" value={time} unit={dateStr} small />
        </div>
      </div>
    </div>
  );
}

function SensorCard({ icon, value, unit, sub, subUnit, label, active, small }: {
  icon: string; value: string; unit: string; sub?: string; subUnit?: string; label?: string; active?: boolean; small?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-[20px] p-4 text-center relative overflow-hidden ${active ? 'border-primary' : 'border-border'}`}>
      {active && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse-green" />}
      <div className="text-[28px] mb-1.5">{icon}</div>
      <div className={`font-display text-primary leading-none ${small ? 'text-[16px]' : 'text-[28px]'}`}>{value}</div>
      <div className="font-mono text-[9px] text-muted-foreground tracking-[1px] mt-0.5">{unit}</div>
      {sub && (
        <>
          <div className="font-display text-[18px] text-primary mt-1">{sub}</div>
          {subUnit && <div className="font-mono text-[9px] text-muted-foreground tracking-[1px]">{subUnit}</div>}
        </>
      )}
    </div>
  );
}
