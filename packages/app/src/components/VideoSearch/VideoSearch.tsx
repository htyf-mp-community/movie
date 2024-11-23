import React, { useRef, useState } from 'react';
import { TextInput, TouchableHighlight } from 'react-native';
import { i18n } from '../../../i18n';
import { theme } from '../../utils';

export const VideoSearch: React.FC<{
  searchVideo: (keyword: string) => void;
}> = ({ searchVideo }) => {
  const [value, onChangeText] = useState<undefined | string>();

  const inputRef = useRef<TextInput>(null);
  return (
    <TouchableHighlight
      onPress={() => inputRef.current?.focus()}
      hasTVPreferredFocus={true}
      underlayColor={theme.primary}
      style={{
        padding: 0,
        alignItems: 'center',
        borderRadius: 5,
      }}>
      <TextInput
        ref={inputRef}
        placeholderTextColor={theme.whiteA()}
        style={{
          width: '100%',
          padding: 10,
          paddingLeft: 10,
          color: theme.whiteA(),
          borderRadius: 5,
          backgroundColor: theme.grayA(0.4),
          height: 40
        }}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={async () => {
          if (!value) {
            return;
          }
          searchVideo(value);
        }}
        placeholder={i18n.t('search')}
      />
    </TouchableHighlight>
  );
};
