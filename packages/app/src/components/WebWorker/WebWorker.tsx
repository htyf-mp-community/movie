import React, { useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';

import { Enc } from '../../utils/m3u8';

export type DecryptData = {
  enc: Enc
  encryptedBytes: string
}

type Props = {
  data?: DecryptData
  onDone: (result: string) => void
}

export const WebWorker = ({ data, onDone }: Props) => {
  const webviewRef = useRef<any>(null);

  useEffect(() => {
    if (!data) {
      return
    }
    webviewRef.current.postMessage(JSON.stringify(data));
  }, [data])

  const handleWebViewMessage = (event: any) => {
    const message = event.nativeEvent.data;
    onDone(message);
  };

  return (
    <WebView
      ref={webviewRef}
      source={{
        html: `
        <!DOCTYPE html>
        <html>
        
        <head>
          <title>WebWorker</title>
          <script src="https://bundle.run/buffer@6.0.3"></script>
          <script src="https://cdn.jsdelivr.net/npm/aes-js@3.1.2/index.min.js"></script>
        </head>
        
        <body>
          <script>
            function decrypt(enc, encryptedBytes) {
              const secretKey = enc.key; // 128-bit key (16 bytes)
              const byteBuffer = buffer.Buffer.from(enc.iv.slice(2), 'hex');
        
              const aesCbc = new aesjs.ModeOfOperation.cbc(
                secretKey.data,
                new Uint8Array(byteBuffer)
              );
        
              const decryptedBytes = aesCbc.decrypt(new Uint8Array(buffer.Buffer.from(encryptedBytes, 'base64')));
              return buffer.Buffer.from(decryptedBytes).toString('base64');
            }
        
            document.addEventListener('message', function (event) {
              const data = JSON.parse(event.data);
              const decryptedMessage = decrypt(data.enc, data.encryptedBytes);
              window.ReactNativeWebView.postMessage(decryptedMessage);
            });
          </script>
        </body>
        
        </html>
      ` }}
      onMessage={handleWebViewMessage}
    />
  );
};
