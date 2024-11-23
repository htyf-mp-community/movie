import React, { useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { i18n } from '../../../i18n';
import { useOrientation } from '../../hooks';

import type { TVideo, TVideosRec } from '../../services';
import { theme } from '../../utils';
import { Button } from '../Button';
import { VideoCard } from '../VideoCard';

export const VideoList: React.FC<{
  videoGroup: TVideosRec[];
  onVideoPress: (v: TVideo) => void;
  onMorePress: (path: string, name: string) => void;
  scrollRef?: React.RefObject<FlatList>
  onRefresh?: () => Promise<void>
}> = ({ videoGroup, onVideoPress, onMorePress, scrollRef, onRefresh }) => {
  const { numCols } = useOrientation();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    if (!onRefresh) {
      return
    }
    setRefreshing(true);
    await onRefresh()
    setRefreshing(false);
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={scrollRef}
        data={videoGroup}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={refresh} /> : undefined}
        renderItem={({ item, index }) => {
          const { title, href, videos } = item;
          if (videos.length < 1 && !href) {
            return null;
          }
          return (
            <View
              key={title + index}
            >
              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontSize: 20,
                    color: theme.whiteA(),
                    paddingBottom: 10
                  }}>
                  {title}
                </Text>
                {href ? (
                  <Button
                    onPress={() => onMorePress(href, title)}
                    text={i18n.t('more')}
                    style={{
                      marginLeft: 'auto',
                    }}
                  />
                ) : null}
              </View>
              <FlatList
                key={numCols}
                data={videos}
                numColumns={numCols}
                renderItem={({ item, index }) => {
                  return (
                    <VideoCard
                      style={{ flex: 1 / numCols }}
                      video={item}
                      key={item.title + index}
                      onVideoPress={() => onVideoPress(item)}
                    />
                  );
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
};
