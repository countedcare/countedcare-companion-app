
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const useMobileCapacitor = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const checkPlatform = async () => {
      setIsNative(Capacitor.isNativePlatform());
      
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        setDeviceInfo(info);
        setIsMobile(info.platform === 'ios' || info.platform === 'android');
      } else {
        // Web platform - check screen size
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkPlatform();
    
    // Listen for resize events on web
    const handleResize = () => {
      if (!Capacitor.isNativePlatform()) {
        setIsMobile(window.innerWidth < 768);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    isNative,
    deviceInfo,
    platform: Capacitor.getPlatform(),
  };
};
