import React from 'react';
import { Image, Platform } from 'react-native';

import { imgAssets } from '../../utils';
import { ControlButton } from './ControlButton';
import { useVideoPlayerContext } from './useVideoPlayer';

export const ControlFullscreen: React.FC = () => {
  if (Platform.OS !== 'windows') {
    return null;
  }

  const { actions } = useVideoPlayerContext();
  return (
    <ControlButton onPress={actions.fullscreen}>
      <Image source={imgAssets.fullscreen} />
    </ControlButton>
  );
};
