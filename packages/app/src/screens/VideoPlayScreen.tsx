import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TVideoPlay } from '../services';
import { useVideoContext } from '../hooks';
import { VideoPlayer } from '../components';
import { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

export const VideoPlayScreen = ({ route, navigation }: Props) => {
  const { video, local } = route.params
  const {
    actions: { playVideo, playOfflineVideo },
  } = useVideoContext();

  const [videoPlay, setVideoPlay] = useState<TVideoPlay>();

  useEffect(() => {
    if (local) {
      playOfflineVideo(video.url, video.title).
        then(setVideoPlay)
    } else {
      playVideo(video).
        then(setVideoPlay)
    }
  }, [video, local])

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      }}>
      <VideoPlayer
        onBack={navigation.goBack}
        playNext={() => {
          const nextIdx = video.index - 1
          if (nextIdx < 0) {
            return
          }
          const next = video.eps[nextIdx]
          navigation.replace(
            'Play',
            { video: { ...video, index: nextIdx, ep: next.ep, url: next.href }, local }
          )
        }}
        hasNext={video.index - 1 >= 0}
        key={video.url}
        url={videoPlay?.url}
        title={video.title + ' ' + video.ep}
      />
    </View>
  );
};
