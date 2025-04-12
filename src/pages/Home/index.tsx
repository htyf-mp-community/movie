import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ListRenderItem, Alert, Image } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import lodash from 'lodash';
import { setDBData, setHomeData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';
import Item from '@/components/item';
import Skeleton from '@/components/Skeleton';
import type { TVideo } from '@/services';
import type { HistoryItem, AppsState } from '@/_UIHOOKS_/store/slices/appsSlice';

// 首页状态接口
interface HomeState {
  items?: string[];
  videos?: TVideo[];
  [key: string]: any;
}

// 每行显示的列数
const NUM_COLUMNS = 2;

/**
 * 首页组件
 * 显示历史记录和热门影视列表
 */
function Home() {
  // 状态和上下文
  const ui = useUI();
  const apps = useAppSelector((state) => state.apps) as AppsState;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const home = apps?.home as HomeState;
  const isDebug = apps?.__ENV__ === 'DEV';
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 获取首页数据
   * 获取视频列表并更新状态
   */
  const getData = useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const videos = await ui.getHomeVideoList();
      if (videos && videos.length > 0) {
        dispatch(
          setHomeData({
            videos,
            items: videos.map((video) => video.href),
          }),
        );
        dispatch(setDBData(videos));
      }
    } catch (error) {
      console.error('获取首页数据失败:', error);
      Alert.alert('提示', '加载数据失败，请稍后重试');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  /**
   * 处理视频项点击
   * @param info - 视频信息
   */
  const handleVideoPress = useCallback((info: TVideo) => {
    navigation.navigate('Details', {
      name: info.title,
      url: encodeURIComponent(info.href),
    });
  }, []);

  /**
   * 处理搜索按钮点击
   */
  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search');
  }, []);

  /**
   * 历史记录列表
   * 按时间倒序排序
   */
  const hisList = useMemo(() => {
    if (apps?.history) {
      return lodash.orderBy(Object.values(apps.history), ['time'], ['desc']);
    }
    return [];
  }, [apps?.history]);

  /**
   * 渲染历史记录列表
   */
  const renderHistoryList = useCallback(() => {
    if (!hisList?.length) {
      return null;
    }

    return (
      <View style={tw`mt-[20px]`}>
        <Text style={tw`text-[18px] font-bold mb-[10px] ml-[10px]`}>历史记录</Text>
        <FlatList
          data={hisList}
          renderItem={({ item }) => (
            <View style={tw`w-[250px]`}>
              <Item
                key={item.url}
                url={item.url}
                onPress={handleVideoPress}
              />
            </View>
          )}
          keyExtractor={(item) => item.url}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        {jssdk.AdBanner && <jssdk.AdBanner />}
        <Text style={tw`text-[18px] font-bold mb-[10px] ml-[10px]`}>热门影视</Text>
      </View>
    );
  }, [hisList, handleVideoPress]);

  /**
   * 渲染视频项
   */
  const renderVideoItem: ListRenderItem<string> = useCallback(({ item }) => {
    const video = home?.videos?.find(v => v.href === item);
    if (!video) return null;

    return (
      <Item
        url={item}
        title={video.title}
        year={video.year}
        cover={video.cover}
        rating={video.rating}
        type={video.details?.type}
        description={video.description}
        onPress={handleVideoPress}
      />
    );
  }, [home?.videos, handleVideoPress]);

  // 初始化加载数据
  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={tw`flex-1 bg-black`}>
      <Appbar.Header
        mode="small"
        style={tw`h-[50px] bg-black`}
      >
        <Appbar.Content titleStyle={tw`text-[18px] text-white`} title="首页" />
      </Appbar.Header>

      <TouchableOpacity
        style={tw`p-[10px] bg-[#333] rounded-[20px] m-[10px]`}
        onPress={handleSearchPress}
      >
        <Text style={tw`text-[#888] text-[16px] text-center`}>点击搜索电影...</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <Skeleton loading={isLoading} />
        </View>
      ) : (
        <FlatList
          style={tw`flex-1`}
          data={home?.items || []}
          ListHeaderComponent={renderHistoryList}
          ListFooterComponent={() => <View style={tw`h-[180px]`} />}
          renderItem={renderVideoItem}
          keyExtractor={(item, index) => `${index}_${item}`}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={tw`px-[10px]`}
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