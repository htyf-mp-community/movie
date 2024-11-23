import React from 'react';
import { Image } from 'react-native';

import { imgAssets } from '../../utils';
import { ControlButton } from './ControlButton';
import { useVideoPlayerContext } from './useVideoPlayer';

export const ControlPlayPause: React.FC = () => {
  const { state, actions } = useVideoPlayerContext();
  return (
    <ControlButton onPress={actions.setPlayPause}>
      <Image source={!state.paused ? imgAssets.pause : imgAssets.play} />
    </ControlButton>
  );
};
