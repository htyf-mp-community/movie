import React from 'react';
import { Image } from 'react-native';

import { imgAssets } from '../../utils';
import { ControlButton } from './ControlButton';
import { useVideoPlayerContext } from './useVideoPlayer';

export const ControlFForward: React.FC = () => {
  const { actions } = useVideoPlayerContext();
  return (
    <ControlButton onPress={actions.fforward}>
      <Image source={imgAssets.fforward} />
    </ControlButton>
  );
};
