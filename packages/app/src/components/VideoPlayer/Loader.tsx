import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '../../utils';

export const Loader: React.FC = () => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ActivityIndicator size={30} color={theme.primary} />
    </View>
  );
};
