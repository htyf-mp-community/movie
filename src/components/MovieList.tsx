import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, ActivityIndicator, RefreshControl, View } from 'react-native';
import tw from 'twrnc';
import Item from '@/components/item';
import type { TVideo, MovieItem } from '@/types';

/**
 * 电影列表组件属性接口
 * @interface MovieListProps
 */
interface MovieListProps {
  data: TVideo[] | MovieItem[];
  loading: boolean;
  refreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onItemPress: (item: TVideo | MovieItem) => void;
}

/**
 * 电影列表组件
 * 用于显示电影列表，支持下拉刷新和上拉加载更多
 * @component MovieList
 */
const MovieList: React.FC<MovieListProps> = ({
  data,
  loading,
  refreshing,
  isLoadingMore,
  hasMore,
  onRefresh,
  onLoadMore,
  onItemPress,
}) => {
  /**
   * 渲染加载状态
   */
  const renderLoading = useCallback(() => (
    <View style={tw`h-[180px] justify-start items-center`}>
      {isLoadingMore && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  ), [isLoadingMore]);

  /**
   * 渲染电影项
   */
  const renderMovieItem = useCallback(({ item }: { item: TVideo | MovieItem }) => (
    <Item
      url={item.href}
      title={item.title}
      year={item.year}
      cover={item.cover}
      onPress={() => onItemPress(item)}
    />
  ), [onItemPress]);

  /**
   * 渲染刷新控件
   */
  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#E50914']}
      tintColor="#E50914"
      title="正在刷新..."
      titleColor="#E50914"
    />
  ), [refreshing, onRefresh]);

  return (
    <FlatList
      data={data}
      renderItem={renderMovieItem}
      keyExtractor={(item) => item.href}
      numColumns={2}
      contentContainerStyle={styles.movieList}
      refreshControl={refreshControl}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderLoading}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};

const styles = StyleSheet.create({
  movieList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});

export default MovieList; 