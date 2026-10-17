import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext(null);

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' && 'onLine' in navigator ? navigator.onLine : true;
  });

  // Manual simulation mode for hackathon / testing
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(() => new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSyncedTime(new Date());
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveIsOffline = !isOnline || isSimulatedOffline;

  const toggleSimulation = () => {
    setIsSimulatedOffline((prev) => !prev);
    if (isSimulatedOffline) {
      setLastSyncedTime(new Date());
    }
  };

  const refreshSync = () => {
    setLastSyncedTime(new Date());
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline: !effectiveIsOffline,
        isOffline: effectiveIsOffline,
        isSimulated: isSimulatedOffline,
        toggleSimulation,
        lastSyncedTime,
        refreshSync
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;
