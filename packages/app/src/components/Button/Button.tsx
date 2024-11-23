import React from 'react';
import { Text, TextStyle, TouchableHighlight, View, ViewStyle } from 'react-native';
import { theme } from '../../utils';

export const Button: React.FC<{
  text: string;
  onPress: () => void;
  touchStyle?: ViewStyle
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: JSX.Element
  disabled?: boolean
}> = ({ onPress, text, touchStyle, style, textStyle, icon, disabled }) => {
  return (
    <TouchableHighlight
      underlayColor={theme.whiteA(0.2)}
      onPress={onPress}
      style={touchStyle}
      disabled={disabled}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: 5,
        ...style,
      }}
      >
        {icon}
        <Text
          style={{
            padding: 8,
            fontSize: 18,
            color: theme.whiteA(),
            ...textStyle,
          }}>
          {text}
        </Text>
      </View>
    </TouchableHighlight>
  );
};
