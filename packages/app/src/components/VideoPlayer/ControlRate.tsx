import React from 'react';
import { Text } from 'react-native';
import { theme } from '../../utils';

import { ControlButton } from './ControlButton';
import { useVideoPlayerContext } from './useVideoPlayer';

export const ControlRate: React.FC = () => {
  const {
    state: { rate },
    actions,
  } = useVideoPlayerContext();

  return (
    <ControlButton onPress={actions.setPlayRate}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          color: theme.whiteA(),
        }}>
        {rate.toString().length > 1 ? `${rate} x` : `${rate}.0 x`}
      </Text>
    </ControlButton>
  );
};
