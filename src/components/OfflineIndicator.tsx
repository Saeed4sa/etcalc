import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-lg bg-amber-950/90 border border-amber-600/50 px-3 py-1.5 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2">
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode — Full scientific engine & local storage active</span>
    </div>
  );
};

export const ConnectionStatusBadge: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
        isOnline
          ? 'text-emerald-400/90 hover:text-emerald-300'
          : 'text-amber-400/90 hover:text-amber-300'
      }`}
      title={isOnline ? 'Online: Service worker precache verified' : 'Offline: Operating from local service worker cache'}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
        }`}
      />
      <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
  );
};
