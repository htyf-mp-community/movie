import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import { setDBData, setHistoryData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Appbar, MD2Colors } from 'react-native-paper';
import lodash from 'lodash'
import URLParse from 'url-parse';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TVideo } from '@/services';
import type { RootStackParamList } from '..';
import type { HistoryItem } from '@/_UIHOOKS_/store/slices/appsSlice';

// 详情项接口
interface DetailItem {
  label: string;
  value: string | string[];
}

// 视频播放器配置接口
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
 */
function Details() {
  const router = useRoute();
  const params = router.params as RootStackParamList['Details'];
  const url = decodeURIComponent(`${params?.url}`);
  const ui = useUI();
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const db = useAppSelector(i => i.apps?.db || {});
  const [refreshing, setRefreshing] = useState(false);
  const [playLoading, setPlayLoading] = useState(false);

  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const movieDetail = useMemo(() => {
    const urlObj = URLParse(url, true);
    const pathname = urlObj.pathname;
    return lodash.get(db, `${pathname}`, undefined) as TVideo;
  }, [db, url])

  const historyInfo = useMemo(() => {
    return lodash.get(apps?.history, `${url}`, undefined) as HistoryItem | undefined;
  }, [apps?.history, url]);

  const getData = useCallback(async () => {
    if (!url || !jssdk) return;

    setRefreshing(true);
    try {
      const videoData = await ui.getVideoSources(url);
      if (videoData) {
        dispatch(setDBData(videoData));
        // 如果视频有播放列表，自动记录第一个播放源到历史记录
        if (videoData.playList && videoData.playList.length > 0) {
          dispatch(
            setHistoryData({
              url: url,
              playUrl: videoData.playList[0].url,
              time: Date.now(),
            }),
          );
        }
      }
    } catch (error) {
      console.error('获取视频源失败:', error);
    } finally {
      setRefreshing(false);
    }
  }, [url]);

  const getPlayUrl = useCallback(async (url: string, hasPlay: boolean = false): Promise<void> => {
    if (!url || !jssdk) return;
    setPlayLoading(true);
    try {
      const data = await ui.getVideoUrl(url);
      // Alert.alert(JSON.stringify(data.headers.Host));
      // return
      const playerConfig: VideoPlayerConfig = {
        url: data.url,
        title: movieDetail.title,
        headers: data.headers,
        onPlayEnd: () => {
          console.log('播放结束');
        },
        onPlayError: () => {
          console.error('播放出错');
        },
      };
      jssdk.openVideoPlayer(playerConfig);
    } catch (error) {
      console.error('获取播放地址失败:', error);
    } finally {
      setPlayLoading(false);
    }
  }, [movieDetail]);

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

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

  const renderDetailItem = useCallback(({ item }: { item: DetailItem }) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{item.label}</Text>
      <Text style={styles.detailValue}>
        {Array.isArray(item.value) ? item.value.join(', ') : item.value}
      </Text>
    </View>
  ), []);

  const detailItems = useMemo(() => {
    if (!movieDetail?.details) return [];

    const items = [
      { label: '类型', value: movieDetail.details.type },
      { label: '地区', value: movieDetail.details.region },
      { label: '年份', value: movieDetail.details.year },
      { label: '别名', value: movieDetail.details.alias },
      { label: '上映日期', value: movieDetail.details.releaseDate },
      { label: '导演', value: movieDetail.details.director },
      { label: '编剧', value: movieDetail.details.writer },
      { label: '主演', value: movieDetail.details.actors },
      { label: '语言', value: movieDetail.details.language }
    ];

    return items.filter(item => {
      if (Array.isArray(item.value)) {
        return item.value.length > 0 && item.value[0] !== '';
      }
      return item.value && item.value !== '';
    });
  }, [movieDetail]);

  const renderPlayItem = useCallback(({ item }: { item: TVideo['playList'][0] }) => {
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
          dispatch(
            setHistoryData({
              url: url,
              playUrl: item.url,
              time: Date.now(),
            }),
          );
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
  }, [historyInfo, playLoading, url, dispatch, getPlayUrl]);

  useEffect(() => {
    getData();
  }, [getData]);

  return <View style={{
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000'
  }}>
    <Appbar.Header mode="small" style={[tw`h-[50px]`, { backgroundColor: 'transparent' }]}>
      <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
      <Appbar.Content titleStyle={[tw`text-[18px]`, { color: '#fff' }]} title={params?.name || '详情'} />
    </Appbar.Header>
    <View style={tw`flex-1`}>
      <View style={tw`h-0 flex-1`}>
        <ScrollView style={tw`flex-grow`}
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
          <View style={tw`p-[16px]`}>
            {/* 封面图和标题 */}
            <Image
              source={{ uri: movieDetail?.cover }}
              style={[styles.movieImage, { height: 500 }]}
              resizeMode="cover"
            />
            <Text style={[styles.movieTitle, { color: '#fff' }]}>{movieDetail?.title}</Text>

            {/* 年份 */}
            <Text style={[styles.rating, { color: '#808080' }]}>{movieDetail?.year || ''}</Text>
            {
              jssdk.AdBanner ? <jssdk.AdBanner /> : undefined
            }
            {/* 详细信息 */}
            <FlatList
              data={detailItems}
              renderItem={renderDetailItem}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={styles.detailList}
            />

            {/* 电影简介 */}
            <Text style={[styles.context, { color: '#fff' }]}>{movieDetail?.description}</Text>
          </View>
        </ScrollView>
      </View>
      {/* 底部播放按钮 */}
      <TouchableOpacity style={[
        styles.playButton,
        tw`pb-[${bottom}px]`,
        { backgroundColor: '#E50914' }
      ]} onPress={handleOpenBottomSheet}>
        <Text style={styles.playButtonText}>选择播放列表</Text>
      </TouchableOpacity>
    </View>
    {/* Bottom Sheet for playlist */}
    <BottomSheet
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: '#141414' }}
      handleIndicatorStyle={{ backgroundColor: '#808080' }}
    >
      <View style={[
        styles.bottomSheetContent,
        tw`pb-[${bottom}px]`,
        { backgroundColor: '#141414' }
      ]}>
        <Text style={[styles.sheetHeader, { color: '#fff' }]}>播放列表：</Text>
        <FlatList
          data={movieDetail?.playList || []}
          renderItem={renderPlayItem}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    </BottomSheet>
  </View>;
}

export default Details;

const styles = StyleSheet.create({
  container: {
    flexGrow: 2,
    backgroundColor: '#000',
  },
  movieImage: {
    width: '100%',
    borderRadius: 10,
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  rating: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
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
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
  },
});

