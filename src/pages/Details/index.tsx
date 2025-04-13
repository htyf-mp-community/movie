import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ListRenderItem,
  Platform
} from 'react-native';
import tw from 'twrnc';
import { useUI } from '@/hooks';
import jssdk from '@htyf-mp/js-sdk';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Appbar, MD2Colors } from 'react-native-paper';
import URLParse from 'url-parse';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TVideo } from '@/services';
import type { RootStackParamList } from '..';
import { useAppStore } from '@/store';

/**
 * 详情项接口
 * @interface DetailItem
 * @property {string} label - 详情项的标签
 * @property {string | string[]} value - 详情项的值，可以是字符串或字符串数组
 */
interface DetailItem {
  label: string;
  value: string | string[];
}

/**
 * 视频播放器配置接口
 * @interface VideoPlayerConfig
 * @property {string} url - 视频播放地址
 * @property {string} title - 视频标题
 * @property {Record<string, string>} [headers] - 请求头信息
 * @property {() => void} [onPlayEnd] - 播放结束回调
 * @property {() => void} [onPlayError] - 播放错误回调
 */
interface VideoPlayerConfig {
  url: string;
  title: string;
  headers?: Record<string, string>;
  onPlayEnd?: () => void;
  onPlayError?: () => void;
}

/**
 * 详情页面组件
 * 显示电影详情、播放列表和播放功能
 * @component Details
 */
function Details() {
  // 路由参数和导航
  const router = useRoute();
  const params = router.params as RootStackParamList['Details'];
  const url = decodeURIComponent(`${params?.url}`);
  const navigation = useNavigation();

  // UI 相关
  const ui = useUI();
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [playLoading, setPlayLoading] = useState(false);

  // 状态管理
  const updateVideoData = useAppStore(state => state.updateVideoData);
  const getVideoData = useAppStore(state => state.getVideoData);
  const updateHistory = useAppStore(state => state.updateHistory);
  const getHistory = useAppStore(state => state.getHistory);

  const movieDetail = useAppStore(state => state.videoData[url]);

  // BottomSheet 配置
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  /**
   * 处理错误情况
   * @param {string} message - 错误消息
   * @param {Error} [error] - 错误对象
   */
  const handleError = useCallback((message: string, error?: Error) => {
    console.error(message, error);
    Alert.alert('错误', message);
  }, []);

  /**
   * 检查 URL 是否有效
   * @param {string} url - 要检查的 URL
   * @returns {boolean} URL 是否有效
   */
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * 获取历史记录信息
   */
  const historyInfo = useMemo(() => {
    return getHistory(url);
  }, [url, getHistory]);

  /**
   * 获取视频源数据
   * 包括视频详情、播放列表等信息
   */
  const getData = useCallback(async () => {
    if (!url || !jssdk) {
      handleError('无效的视频地址或播放器未初始化');
      return;
    }

    if (!isValidUrl(url)) {
      handleError('无效的视频地址');
      return;
    }

    setRefreshing(true);
    try {
      const videoData = await ui.getVideoSources(url);
      if (!videoData) {
        handleError('获取视频源失败');
        return;
      }
      // 更新视频详情数据
      updateVideoData(url, videoData);

    } catch (error) {
      handleError('获取视频源失败，请稍后重试', error as Error);
    } finally {
      setRefreshing(false);
    }
  }, [url, updateVideoData, updateHistory, handleError, isValidUrl]);

  /**
   * 获取视频播放地址并播放
   * @param {string} url - 视频播放地址
   * @param {boolean} [hasPlay=false] - 是否直接播放
   */
  const getPlayUrl = useCallback(async (url: string, hasPlay: boolean = false): Promise<void> => {
    if (!url || !jssdk) {
      handleError('无效的视频地址或播放器未初始化');
      return;
    }

    if (!isValidUrl(url)) {
      handleError('无效的视频地址');
      return;
    }

    setPlayLoading(true);
    try {
      // 更新历史记录
      updateHistory({
        url: url,
        playUrl: url,
        time: Date.now(),
      });
      const data = await ui.getVideoUrl(url);
      if (!data?.url) {
        handleError('获取播放地址失败');
        return;
      }
      const playerConfig: VideoPlayerConfig = {
        url: data.url,
        title: movieDetail?.title || '未知视频',
        headers: data.headers,
        onPlayEnd: () => {
          console.log('播放结束');
        },
        onPlayError: () => {
          handleError('视频播放出错，请稍后重试');
        },
      };
      jssdk.openVideoPlayer(playerConfig);
    } catch (error) {
      handleError('获取播放地址失败，请稍后重试', error as Error);
    } finally {
      setPlayLoading(false);
    }
  }, [movieDetail, handleError, isValidUrl]);

  /**
   * 打开底部播放列表
   */
  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  /**
   * 渲染底部背景
   */
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style]}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  /**
   * 渲染详情项
   */
  const renderDetailItem = useCallback<ListRenderItem<DetailItem>>(({ item }) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{item.label}</Text>
      <Text style={styles.detailValue}>
        {Array.isArray(item.value) ? item.value.join(', ') : item.value}
      </Text>
    </View>
  ), []);

  /**
   * 获取详情项数据
   */
  const detailItems = useMemo(() => {
    if (!movieDetail) return [];

    const items: DetailItem[] = [
      { label: '类型', value: movieDetail.type },
      { label: '地区', value: movieDetail.region },
      { label: '年份', value: movieDetail.year },
      { label: '别名', value: movieDetail.alias },
      { label: '上映日期', value: movieDetail.releaseDate },
      { label: '导演', value: movieDetail.director },
      { label: '编剧', value: movieDetail.writer },
      { label: '主演', value: movieDetail.actors },
      { label: '语言', value: movieDetail.language }
    ];

    return items.filter(item => {
      if (Array.isArray(item.value)) {
        return item.value.length > 0 && item.value[0] !== '';
      }
      return item.value && item.value !== '';
    });
  }, [movieDetail]);

  /**
   * 渲染播放列表项
   */
  const renderPlayItem = useCallback<ListRenderItem<TVideo['playList'][0]>>(({ item }) => {
    const itemUrlObj = new URLParse(`${item.url}`);
    const hisUrlObj = new URLParse(`${historyInfo?.playUrl}`);
    const hisBtn = itemUrlObj.pathname === hisUrlObj.pathname;
    const loading = hisBtn && playLoading;

    return (
      <TouchableOpacity
        style={[
          styles.playItem,
          tw`gap-[8px]`,
          hisBtn ? tw`bg-red-300` : undefined,
        ]}
        disabled={loading}
        onPress={() => {
          updateHistory({
            url: url,
            playUrl: item.url,
            time: Date.now(),
          });
          getPlayUrl(item.url, true);
        }}
      >
        <Text style={styles.playText}>{item.title}</Text>
        {loading && (
          <View style={tw`justify-center items-center gap-[8px] flex-row`}>
            <ActivityIndicator animating={true} color={MD2Colors.red800} />
            <Text style={tw`text-[${MD2Colors.red800}]`}>加载视频中...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [historyInfo, playLoading, url, updateHistory, getPlayUrl]);

  // 初始化数据
  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" style={[styles.header, { backgroundColor: 'transparent' }]}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content titleStyle={styles.headerTitle} title={params?.name || '详情'} />
      </Appbar.Header>
      <View style={styles.content}>
        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={getData}
                colors={['#E50914']}
                tintColor="#E50914"
                title="正在刷新..."
                titleColor="#E50914"
              />
            }
          >
            {movieDetail ? (
              <View style={styles.detailContainer}>
                <Image
                  source={{ uri: movieDetail.cover }}
                  style={styles.movieImage}
                  resizeMode="cover"
                  onError={() => handleError('加载封面图失败')}
                />
                <Text style={styles.movieTitle}>{movieDetail.title}</Text>
                <Text style={styles.rating}>{movieDetail.year || ''}</Text>
                {jssdk.AdBanner && <jssdk.AdBanner />}
                <FlatList
                  data={detailItems}
                  renderItem={renderDetailItem}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={styles.detailList}
                  scrollEnabled={false}
                  removeClippedSubviews={Platform.OS === 'android'}
                />
                <Text style={styles.context}>{movieDetail.description}</Text>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            )}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={[styles.playButton, { paddingBottom: bottom }]}
          onPress={handleOpenBottomSheet}
          disabled={!movieDetail?.playList?.length}
        >
          <Text style={styles.playButtonText}>
            {movieDetail?.playList?.length ? '选择播放列表' : '暂无播放源'}
          </Text>
        </TouchableOpacity>
      </View>
      <BottomSheet
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <View style={[styles.bottomSheetContent, { paddingBottom: bottom }]}>
          <Text style={styles.sheetHeader}>播放列表：</Text>
          <FlatList
            data={movieDetail?.playList || []}
            renderItem={renderPlayItem}
            keyExtractor={(_, index) => index.toString()}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

export default Details;

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000',
  },
  header: {
    height: 50,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    height: 0,
  },
  scrollView: {
    flexGrow: 1,
  },
  detailContainer: {
    padding: 16,
  },
  movieImage: {
    width: '100%',
    height: 500,
    borderRadius: 10,
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#fff',
  },
  rating: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#808080',
  },
  detailList: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#808080',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: '#fff',
  },
  playButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E50914',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#141414',
  },
  bottomSheetBackground: {
    backgroundColor: '#141414',
  },
  bottomSheetIndicator: {
    backgroundColor: '#808080',
  },
  sheetHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  playItem: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginVertical: 5,
  },
  playText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  context: {
    fontSize: 16,
    marginVertical: 20,
    lineHeight: 24,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
});

