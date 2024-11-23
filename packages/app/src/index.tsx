import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, Platform } from 'react-native';

import { useVideo, VideoContext, useDownload, DownloadContext } from './hooks';
import { Screen } from './screens';
import { theme } from './utils';
import { WebWorker } from './components';

import type { Enc } from './utils/m3u8';
import type { DecryptData } from './components/WebWorker/WebWorker';

const App = () => {
  const decryptCh = useRef<((value: string | PromiseLike<string>) => void) | null>(null)
  const [decryptData, setDecryptData] = useState<DecryptData>()

  const decrypt = async (enc: Enc, encryptedBytes: string) => {
    setDecryptData({ enc, encryptedBytes })

    const wait = new Promise<string>((res) => {
      decryptCh.current = res
    })

    return await wait
  }

  const video = useVideo();
  const download = useDownload({ getVideoUrl: video.actions.getVideoUrl, decrypt });

  const error = video.state.error;
  useEffect(() => {
    if (!error) {
      return;
    }

    setTimeout(() => {
      video.actions.setError('');
    }, 1000);
  }, [error]);

  return (
    <VideoContext.Provider value={video}>
      <DownloadContext.Provider value={download}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: theme.blackA(),
          }}>
          {(!Platform.isTV && Platform.OS !== 'web') &&
            <View style={{ height: 0, width: 0, overflow: 'hidden' }}>
              <WebWorker
                data={decryptData}
                onDone={(decrypted) => {
                  if (decryptCh.current) {
                    decryptCh.current(decrypted)
                    decryptCh.current = null
                    setDecryptData(undefined)
                  }
                }} />
            </View>
          }
          {error !== '' && <Error text={error} />}
          {video.state.loading && video.state.init && (
            <ActivityIndicator
              color={theme.primary}
              size={48}
              style={{
                right: 20,
                top: 20,
                alignSelf: 'flex-end',
                position: 'absolute',
                zIndex: 99,
              }}
            />
          )}
          <Screen />
        </SafeAreaView>
      </DownloadContext.Provider>
    </VideoContext.Provider>
  );
};

const Error: React.FC<{ text: string }> = ({ text }) => {
  return (
    <View
      style={{
        padding: 10,
        alignItems: 'center',
        backgroundColor: theme.warn,
      }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.whiteA(),
        }}>
        {text}
      </Text>
    </View>
  )
}
export default App;
