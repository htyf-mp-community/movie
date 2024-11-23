import React from 'react';
import { TouchableHighlight } from 'react-native';
import { theme } from '../../utils';

export const ControlButton: React.FC<React.PropsWithChildren<{ onPress?: () => void }>> = ({
  children,
  onPress,
}) => {
  return (
    <TouchableHighlight
      hasTVPreferredFocus={true}
      underlayColor={theme.whiteA(0.4)}
      onPress={onPress}
      style={{ padding: 16, borderRadius: 999 }}>
      {children}
    </TouchableHighlight>
  );
};
