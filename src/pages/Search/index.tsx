import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TextInput, RefreshControl, Alert } from 'react-native';
import tw from 'twrnc';
import lodash from 'lodash';
import { setDBData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import { useImmer } from 'use-immer';
import jssdk, { RequestOptions } from '@htyf-mp/js-sdk';
import Item from '@/components/item';
import jsCrawler, { host } from '@/utils/js-crawler';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import type { TVideo } from '@/services';

// 搜索请求参数接口
interface SearchQuery {
  name: string;
  page: number;
}

// 搜索响应数据接口
interface SearchResponse {
  list: TVideo[];
  [key: string]: any;
}

// 数据对象接口
interface DataObject {
  [key: string]: TVideo[];
}

// 分页信息接口
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * 获取搜索结果
 * @param query - 搜索参数
 * @param opt - 请求选项
 * @returns 搜索结果
 */
export async function getSearch(
  query: SearchQuery,
  opt?: Partial<RequestOptions>,
): Promise<SearchResponse | undefined> {
  const url = `${host}daoyongjiek0shibushiyoubing?q=${query?.name}&f=_all&p=${query.page || 1}`;
  const data = await jssdk?.puppeteer({
    url,
    jscode: `${jsCrawler}`,
    debug: false,
    wait: 2000,
    timeout: 1000 * 10,
    callback: () => { },
    ...opt,
  });
  return data;
}

/**
 * 验证搜索功能是否可用
 * @returns 是否验证成功
 */
export async function auth(): Promise<boolean> {
  const query = { name: '我', page: 1 };
  const data = await getSearch(query, {
    debug: true,
    wait: 0,
    timeout: 1000 * 60 * 3,
  });
  return !!data;
}

let isFirstSearch = true;

/**
 * 电影搜索页面组件
 * 提供搜索功能，显示搜索结果列表
 */
const MovieSearchPage: React.FC = () => {
  // 引用和状态
  const ui = useUI();
  const flatListRef = useRef<FlatList<TVideo>>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const apps = useAppSelector(i => i.apps);

  // 状态管理
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dataObj, setDataObj] = useImmer<DataObject>({});
  const [searchword, setSearchword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  });

  const isDebug = apps?.__ENV__ === 'DEV';

  /**
   * 获取搜索结果数据
   * @param searchword - 搜索关键词
   * @param page - 页码
   */
  const getData = useCallback(
    async (searchword: string = '', page: number = 1) => {
      if (!searchword) return;

      if (page <= 1 && flatListRef.current) {
        setIsRefreshing(true);
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }

      try {
        if (jssdk) {
          setLoading(true);
          const data = await ui.getVideoSearchResult(searchword, page);
          if (data?.list) {
            // 将 VideoItem 转换为 TVideo 格式
            const videoList = data.list.map(item => ({
              href: item.link,
              img: item.image,
              title: item.title,
              status: item.actors,
              // 添加其他必要字段
              year: '',
              cover: item.image,
              details: {
                type: '',
                region: '',
                year: '',
                alias: [],
                releaseDate: '',
                director: [],
                writer: [],
                actors: item.actors.split(',').map(actor => actor.trim()),
                language: ''
              },
              description: '',
              playList: []
            }));
            
            dispatch(setDBData(videoList));
            setDataObj(_dataObj => {
              if (page === 1) {
                return { 1: videoList };
              }
              _dataObj[page] = videoList;
              return _dataObj;
            });

            // 更新分页信息
            setPagination(prev => ({
              ...prev,
              currentPage: data.pagination.currentPage,
              totalPages: data.pagination.totalPages,
              hasMore: data.pagination.currentPage < data.pagination.totalPages,
            }));
          }
        }
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [dispatch, setDataObj, ui],
  );

  /**
   * 合并所有页面的搜索结果
   */
  const list = useMemo(() => {
    const _list: TVideo[] = [];
    for (const key in dataObj) {
      const items = lodash.get(dataObj, `[${key}]`, []) as TVideo[];
      _list.push(...items);
    }
    return _list;
  }, [dataObj]);

  /**
   * 处理下拉刷新
   */
  const handleRefresh = useCallback(async () => {
    await getData(searchword, 1);
  }, [getData, searchword]);

  /**
   * 处理上拉加载更多
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasMore) return;
    setIsLoadingMore(true);
    await getData(searchword, pagination.currentPage + 1);
    setIsLoadingMore(false);
  }, [isLoadingMore, getData, searchword, pagination]);

  /**
   * 处理搜索提交
   */
  const handleSearchSubmit = useCallback(() => {
    getData(searchword, 1);
  }, [getData, searchword]);

  /**
   * 处理电影项点击
   * @param info - 电影信息
   */
  const handleMoviePress = useCallback((info: TVideo) => {
    navigation.navigate('Details', {
      name: info.name,
      url: encodeURIComponent(info.url),
    });
  }, [navigation]);

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
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content titleStyle={tw`text-[18px]`} title="搜索" />
      </Appbar.Header>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholderTextColor="#333"
          style={styles.searchInput}
          placeholder="搜索电影..."
          value={searchword}
          onChangeText={setSearchword}
          onSubmitEditing={handleSearchSubmit}
        />
      </View>

      {jssdk.AdBanner && <jssdk.AdBanner />}

      {/* 电影列表 */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  movieList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  movieItem: {
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  movieImage: {
    width: 150,
    height: 200,
    borderRadius: 10,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default MovieSearchPage;
