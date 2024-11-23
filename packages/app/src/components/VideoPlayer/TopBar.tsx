import React from 'react';
import { Animated, Text } from 'react-native';

import { useVideoPlayerContext } from './useVideoPlayer';
import { BackButton } from '../BackButton';
import { Button } from '../Button';
import { i18n } from '../../../i18n';
import { theme } from '../../utils';

export const TopBar: React.FC<{
  title: string;
  hasNext: boolean;
  playNext(): void;
  onBack(): void;
}> = ({ title, hasNext, playNext, onBack }) => {
  const {
    refs: { animationsRef },
  } = useVideoPlayerContext();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        opacity: animationsRef.current.controlBar.opacity,
        backgroundColor: theme.blackA(0.5),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <BackButton onPress={onBack} />
      <Text
        style={{
          fontSize: 20,
          marginLeft: 10,
          color: theme.whiteA(),
          flex: 1,
        }}>
        {title}
      </Text>
      {hasNext && (
        <Button
          onPress={playNext}
          text={i18n.t('nextEp')}
          style={{
            marginLeft: 'auto',
            marginRight: 10,
            marginVertical: 0,
            alignSelf: 'flex-start',
          }}
        />
      )}
    </Animated.View>
  );
};
