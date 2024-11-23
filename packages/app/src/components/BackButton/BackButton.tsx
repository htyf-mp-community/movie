import React from 'react';
import { Image, TouchableHighlight, Platform } from 'react-native';

import { imgAssets, theme } from '../../utils';

export const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  if (Platform.isTV) {
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
      <Image source={imgAssets.back} style={{ height: 24, width: 24 }} />
    </TouchableHighlight>
  );
};
