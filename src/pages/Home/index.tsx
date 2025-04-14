import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ListRenderItem,
  Alert,
  StyleSheet
} from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useUI } from '@/hooks';
import jssdk from '@htyf-mp/js-sdk';
import Item from '@/components/item';
import Skeleton from '@/components/Skeleton';
import type { TVideo } from '@/services';
import { useAppStore } from '@/store';

/**
 * 历史记录项接口
 * @interface HistoryItem
 * @property {string} url - 视频 URL
 * @property {string} playUrl - 播放地址
 * @property {number} time - 时间戳
 */
interface HistoryItem {
  url: string;
  playUrl: string;
  time: number;
}

// 每行显示的列数
const NUM_COLUMNS = 2;

/**
 * 首页组件
 * 显示历史记录和热门影视列表
 * @component Home
 */
function Home() {
  // 状态和上下文
  const ui = useUI();
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 从 useAppStore 获取数据
  const { updateVideoData, historyData, homeData, updateHomeData, getVideoData } = useAppStore();

  /**
   * 获取首页数据
   * 获取视频列表并更新状态
   */
  const getData = useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const videos = await ui.getHomeVideoList();
      if (!videos?.length) {
        Alert.alert('提示', '暂无数据');
        return;
      }

      // 将每个电影数据保存到 useAppStore
      videos.forEach(video => {
        updateVideoData(video.href, video);
      });

      // 更新 store 中的 homeData
      updateHomeData(videos.map(video => video.href));

    } catch (error) {
      console.error('获取首页数据失败:', error);
      Alert.alert('提示', '加载数据失败，请稍后重试');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [updateVideoData, updateHomeData]);

  /**
   * 处理视频项点击
   * @param {TVideo} info - 视频信息
   */
  const handleVideoPress = useCallback((info: TVideo) => {
    navigation.navigate('Details', {
      name: info.title,
      url: encodeURIComponent(info.href),
    });
  }, [navigation]);

  /**
   * 处理搜索按钮点击
   */
  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  /**
   * 历史记录列表
   * 按时间倒序排序
   */
  const hisList = useMemo(() => {
    if (!historyData?.length) return [];
    return historyData;
  }, [historyData]);

  /**
   * 渲染历史记录列表
   * @returns {JSX.Element | null} 历史记录列表组件
   */
  const renderHistoryList = useCallback(() => {
    if (!hisList?.length) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>历史记录</Text>
        <FlatList
          data={hisList}
          renderItem={({ item }) => {
            const video = getVideoData(item);
            if (!video) return null;
            return (
              <View style={styles.historyItem}>
                <Item
                  key={item}
                  url={item}
                  title={video.title}
                  year={video.year}
                  cover={video.cover}
                  rating={video.rating}
                  type={video.type}
                  description={video.description}
                  onPress={handleVideoPress}
                />
              </View>
            );
          }}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        {jssdk.AdBanner && <jssdk.AdBanner />}
        <Text style={styles.sectionTitle}>热门影视</Text>
      </View>
    );
  }, [hisList, handleVideoPress, getVideoData]);

  /**
   * 渲染视频项
   * @param {ListRenderItemInfo<string>} { item } - 列表项信息
   * @returns {JSX.Element | null} 视频项组件
   */
  const renderVideoItem: ListRenderItem<string> = useCallback(({ item }) => {
    const video = getVideoData(item);
    if (!video) return null;
    return (
      <Item
        url={item}
        title={video.title}
        year={video.year}
        cover={video.cover}
        rating={video.rating}
        type={video.type}
        description={video.description}
        onPress={handleVideoPress}
      />
    );
  }, [handleVideoPress]);

  /**
   * 渲染加载状态
   * @returns {JSX.Element} 加载状态组件
   */
  const renderLoading = useCallback(() => (
    <View style={styles.loadingContainer}>
      <Skeleton loading={isLoading} />
    </View>
  ), [isLoading]);

  /**
   * 渲染列表底部
   * @returns {JSX.Element} 列表底部组件
   */
  const renderListFooter = useCallback(() => (
    <View style={styles.listFooter} />
  ), []);

  // 初始化加载数据
  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <View style={styles.container}>
      <Appbar.Header
        mode="small"
        style={styles.header}
      >
        <Appbar.Content titleStyle={styles.headerTitle} title="首页" />
      </Appbar.Header>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearchPress}
      >
        <Text style={styles.searchText}>点击搜索电影...</Text>
      </TouchableOpacity>

      {isLoading ? (
        renderLoading()
      ) : (
        <FlatList
          style={styles.list}
          data={homeData || []}
          ListHeaderComponent={renderHistoryList}
          ListFooterComponent={renderListFooter}
          renderItem={renderVideoItem}
          keyExtractor={(item, index) => `${index}_${item}`}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={getData}
              tintColor="#fff"
              titleColor="#fff"
              title="正在加载..."
            />
          }
        />
      )}
    </View>
  );
}

export default Home;

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 50,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
  },
  searchButton: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 20,
    margin: 10,
  },
  searchText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
    color: '#fff',
  },
  historyItem: {
    width: 250,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  listFooter: {
    height: 180,
  },
});