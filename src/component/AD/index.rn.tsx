import { useEffect, useState } from 'react';
import { View } from 'react-native';
import jssdk from '@htyf-mp/js-sdk';

function AD() {
  const [Ad, setAd] = useState<React.FC | undefined>(undefined);
  useEffect(() => {
    const _ad = jssdk.getAd();
    setAd(_ad);
  }, []);
  return Ad ? <Ad /> : undefined;
}

export default AD;
