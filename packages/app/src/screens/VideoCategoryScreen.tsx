import { Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '../utils';
import { TVideosRec } from '../services';
import { useVideoContext } from '../hooks';
import { RootStackParamList } from './types';
import { BackButton, VideoList } from '../components';

type Props = NativeStackScreenProps<RootStackParamList, 'Category'>;

export const VideoCategoryScreen = ({ navigation, route }: Props) => {
  const { actions } = useVideoContext();
  const [videoCategory, setVideoCategory] = useState<TVideosRec[]>([])

  useEffect(() => {
    const { path } = route.params
    actions.getVideoCategory(path).
      then(setVideoCategory)
  }, [route.params])

  return (
    <View style={{ display: 'flex', flex: 1 }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <BackButton onPress={navigation.goBack} />
        <Text style={{ fontSize: 20, color: theme.whiteA() }}>
          {route.params.name}
        </Text>
      </View>

      {videoCategory
        &&
        <VideoList
          onMorePress={(path, name) => {
            navigation.push("List", { name, path })
          }}
          onVideoPress={(video) => {
            navigation.push("Detail", { video })
          }}
          videoGroup={videoCategory}
        />
      }
    </View>
  );
};
