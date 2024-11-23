import React from 'react';
import { Image } from 'react-native';

import { imgAssets } from '../../utils';
import { ControlButton } from './ControlButton';
import { useVideoPlayerContext } from './useVideoPlayer';

export const ControlRewind: React.FC = () => {
  const { actions } = useVideoPlayerContext();
  return (
    <ControlButton onPress={actions.rewind}>
      <Image source={imgAssets.rewind} />
    </ControlButton>
  );
};
