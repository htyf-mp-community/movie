import React from 'react';
import { FlatList } from 'react-native';
import { theme } from '../../utils';
import { Button } from '../Button';

export const VideoProvider: React.FC<{
  activeProvider: string;
  providers: string[];
  setProvider: (p: string) => void;
}> = ({ activeProvider, providers, setProvider }) => {
  return (
    <FlatList
      style={{ flex: 1 }}
      horizontal
      data={providers}
      renderItem={({ item, index }) => {
        const active = activeProvider === item;
        return (
          <Button
            key={item + index}
            text={item}
            onPress={() => setProvider(item)}
            touchStyle={{
              borderRadius: 12,
              marginRight: 10
            }}
            style={{
              paddingHorizontal: 15,
              borderRadius: 5,
              backgroundColor: active ? theme.whiteA() : theme.grayA(0.4),
            }}
            textStyle={{
              fontSize: 14,
              color: active ? theme.blackA() : theme.whiteA(),
              padding: 0,
            }}
          />
        );
      }}
    />
  );
};
