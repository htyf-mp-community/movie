import { setDBData, useAppSelector, useDispatch } from '@/_UIHOOKS_';
import jsCrawler, { host } from '@/utils/js-crawler';
import tw from 'twrnc';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import jssdk from '@htyf-mp/js-sdk';
import { useImmer } from 'use-immer';
import lodash from 'lodash';
import Item from '@/components/item';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import type { TVideo } from '@/services';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

// 电影分类枚举
enum TypeEnum {
  'movie_bt' = '全部',
  'dbtop250' = '豆瓣电影Top250',
  'zuixindianying' = '最新电影',
  'dongmanjuchangban' = '剧场版',
  'benyueremen' = '热映中',
  'gcj' = '国产剧',
  'meijutt' = '美剧',
  'hanjutv' = '韩剧',
  'fanju' = '番剧',
}

// 电影列表项接口
interface MovieItem {
  url: string;
  name: string;
  img?: string;
  [key: string]: any;
}

// 数据对象接口
interface DataObject {
  [key: string]: {
    items: MovieItem[];
    [key: string]: any;
  };
}

// 分页信息接口
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

// 请求配置接口
interface RequestConfig {
  url: string;
  jscode: string;
  debug: boolean;
  wait: number;
  timeout: number;
  callback: () => void;
}

/**
 * 电影列表页面组件
 * 显示不同分类的电影列表，支持下拉刷新和上拉加载更多
 */
const MovieListPage: React.FC = () => {
  // 引用和状态
  const flatListRef = useRef<FlatList<MovieItem>>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const apps = useAppSelector((state) => state.apps);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedTab, setSelectedTab] = useState('全部');
  const [searchword, setSearchword] = useState<keyof typeof TypeEnum>('movie_bt');
  const [dataObj, setDataObj] = useImmer<DataObject>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  });
  
  const isDebug = apps?.__ENV__ === 'DEV';

  /**
   * 构建请求URL
   * @param type - 分类类型
   * @param page - 页码
   * @returns 完整的请求URL
   */
  const buildRequestUrl = useCallback((type: keyof typeof TypeEnum, page: number): string => {
    const baseUrl = type === 'movie_bt' 
      ? `${host}movie_bt/movie_bt_series/dyy`
      : `${host}${type}`;
    
    return page <= 1 ? baseUrl : `${baseUrl}/page/${page}`;
  }, []);

  /**
   * 构建请求配置
   * @param url - 请求URL
   * @returns 请求配置对象
   */
  const buildRequestConfig = useCallback((url: string): RequestConfig => ({
    url,
    jscode: `${jsCrawler}`,
    debug: isDebug,
    wait: 2000,
    timeout: 1000 * 30,
    callback: () => {},
  }), [isDebug]);

  /**
   * 获取电影列表数据
   * @param page - 页码
   * @param type - 分类类型
   */
  const getData = useCallback(
    async (page: number = 1, type: keyof typeof TypeEnum = 'movie_bt') => {
      if (page <= 1 && flatListRef.current) {
        setIsRefreshing(true);
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }

      try {
        const url = buildRequestUrl(type, page);
        const config = buildRequestConfig(url);

        if (jssdk) {
          const data = await jssdk.puppeteer(config);

          if (data?.items?.length) {
            dispatch(setDBData(data.items));
            setDataObj((draft) => {
              if (page === 1) {
                return { 1: data };
              }
              draft[page] = data;
              return draft;
            });

            // 更新分页信息
            setPagination(prev => ({
              ...prev,
              currentPage: page,
              hasMore: data.items.length > 0,
            }));
          }
        }
      } catch (error) {
        console.error('获取电影列表失败:', error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [dispatch, setDataObj, buildRequestUrl, buildRequestConfig],
  );

  /**
   * 处理下拉刷新
   */
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await getData(1, searchword);
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [getData, searchword]);

  /**
   * 处理上拉加载更多
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasMore) return;
    try {
      setIsLoadingMore(true);
      await getData(pagination.currentPage + 1, searchword);
    } catch (error) {
      console.error('加载更多失败:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, getData, searchword, pagination]);

  /**
   * 合并所有页面的电影列表
   */
  const list = useMemo(() => {
    const _list: MovieItem[] = [];
    for (const key in dataObj) {
      const items = lodash.get(dataObj, `[${key}]['items']`, []) as MovieItem[];
      _list.push(...items);
    }
    return _list;
  }, [dataObj]);

  /**
   * 处理分类切换
   * @param key - 分类键
   * @param label - 分类标签
   */
  const handleTabPress = useCallback((key: keyof typeof TypeEnum, label: string) => {
    setSelectedTab(label);
    setSearchword(key);
    setDataObj({}); // 清空数据
    setPagination({
      currentPage: 1,
      totalPages: 1,
      hasMore: true,
    });
  }, [setDataObj]);

  /**
   * 处理电影项点击
   * @param info - 电影信息
   */
  const handleMoviePress = useCallback((info: TVideo) => {
    navigation.navigate('Details', {
      name: info.title,
      url: encodeURIComponent(info.href),
    });
  }, [navigation]);

  // 初始化加载数据
  useEffect(() => {
    getData(1, searchword);
  }, [getData, searchword]);

  /**
   * 渲染分类标签
   */
  const renderTabs = useCallback(() => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.tabsScrollContainer}
    >
      {Object.entries(TypeEnum).map(([key, label]) => (
        <TouchableOpacity 
          key={key} 
          style={[
            styles.tabItem,
            selectedTab === label && styles.selectedTabItem,
          ]} 
          onPress={() => handleTabPress(key as keyof typeof TypeEnum, label)}
        >
          <Text style={[
            styles.tabText,
            selectedTab === label && styles.selectedTabText,
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [handleTabPress, selectedTab]);

  /**
   * 渲染加载状态
   */
  const renderLoading = useCallback(() => (
    <View style={tw`h-[180px] justify-start items-center`}>
      {isLoadingMore && pagination.currentPage > 1 && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  ), [isLoadingMore, pagination.currentPage]);

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" style={tw`h-[50px]`}>
        <Appbar.Content titleStyle={tw`text-[18px]`} title="分类" />
      </Appbar.Header>

      <View style={tw`flex-grow`}>
        <View>{renderTabs()}</View>
        <View style={tw`flex-grow h-0`}>
          {jssdk.AdBanner && <jssdk.AdBanner />}
          <FlatList
            ref={flatListRef}
            data={list}
            renderItem={({ item }) => (
              <Item 
                url={item.url} 
                onPress={handleMoviePress}
              />
            )}
            keyExtractor={(item) => item.url}
            numColumns={2}
            contentContainerStyle={styles.movieList}
            refreshControl={
              <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={handleRefresh} 
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderLoading}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  movieList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  tabsScrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedTabItem: {
    backgroundColor: '#007bff20',
  },
  tabText: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  selectedTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default MovieListPage;
