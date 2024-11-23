import React from 'react';
import { Animated, View } from 'react-native';

import { ControlSeek } from './ControlSeek';
import { ControlRate } from './ControlRate';
import { ControlTimer } from './ControlTimer';
import { ControlRewind } from './ControlRewind';
import { ControlSkipPrev } from './ControlSkipPrev';
import { ControlSkipNext } from './ControlSkipNext';
import { ControlFForward } from './ControlFForward';
import { ControlPlayPause } from './ControlPlayPause';

import { useVideoPlayerContext } from './useVideoPlayer';
import { ControlFullscreen } from './ControlFullscreen';
import { theme } from '../../utils';

export const ControlBar: React.FC = () => {
  const {
    state,
    refs: { animationsRef },
  } = useVideoPlayerContext();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        opacity: animationsRef.current.controlBar.opacity,
        backgroundColor: theme.blackA(0.5),
      }}>
      <ControlSeek />
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 20,
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            position: 'absolute',
            top: -10,
          }}>
          <ControlTimer time={state.currentTime} />
          <ControlTimer time={state.duration} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ControlRate />
          <ControlSkipPrev />
          <ControlRewind />
          <ControlPlayPause />
          <ControlFForward />
          <ControlSkipNext />
          <ControlFullscreen />
        </View>
      </View>
    </Animated.View>
  );
};
