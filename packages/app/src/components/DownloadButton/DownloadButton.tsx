import React from 'react';
import { Image, TouchableHighlight, Platform } from 'react-native';

import { imgAssets, theme } from '../../utils';

export const DownloadButton: React.FC<{ onPress: () => void, active: boolean }> = ({ onPress, active }) => {
  if (Platform.isTV || Platform.OS === 'web') {
    return null;
  }

  return (
    <TouchableHighlight
      underlayColor={theme.whiteA(0.2)}
      onPress={onPress}
      style={{
        padding: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}>
      <Image source={active ? imgAssets.close : imgAssets.download} />
    </TouchableHighlight>
  );
};
