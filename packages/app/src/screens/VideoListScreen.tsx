import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '../utils';
import { TVideosRec } from '../services';
import { RootStackParamList } from './types';
import { VideoCard, BackButton } from '../components';
import { useOrientation, useVideoContext } from '../hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'List'>

export const VideoListScreen = ({ navigation, route }: Props) => {
  const { actions } = useVideoContext();

  const { orientation, numCols } = useOrientation();
  const { name, path } = route.params
  const [page, setPage] = useState(1)

  const [videoList, setVideoList] = useState<TVideosRec | null>(null)

  useEffect(() => {
    const { path } = route.params
    actions.getVideoCategoryMore(path, 1).
      then(setVideoList)
  }, [route.params])

  if (!videoList) {
    return null
  }

  return (
    <View style={{ display: 'flex', flex: 1 }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <BackButton onPress={navigation.goBack} />
        <Text style={{ fontSize: 20, color: theme.whiteA() }}>
          {name}
        </Text>
      </View>
      <FlatList
        onEndReached={async () => {
          const videos = await actions.getVideoCategoryMore(path, page + 1)
          if (!videos) {
            return
          }

          const moreVideos = videos
          moreVideos.videos = [...videoList.videos, ...videos.videos]
          setVideoList(moreVideos)
          setPage(p => p + 1)
        }}
        key={orientation + numCols}
        numColumns={numCols}
        data={videoList.videos}
        columnWrapperStyle={{ marginBottom: 20 }}
        renderItem={({ item, index }) => {
          return (
            <VideoCard
              style={{ flex: 1 / numCols }}
              video={item}
              key={item.title + index}
              onVideoPress={() => {
                navigation.push("Detail", { video: item })
              }}
            />
          );
        }}
      />
    </View>
  );
};
