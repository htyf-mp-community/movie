import { setDBData, useAppSelector, useDispatch } from '@/_UIHOOKS_';
import jsCrawler, { host } from '@/utils/js-crawler';
import tw from 'twrnc';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import jssdk from '@htyf-mp/js-sdk';
import { useImmer } from 'use-immer';
import lodash from 'lodash';
import Item from '@/components/item';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';


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

const MovieListPage = () => {
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const apps = useAppSelector(i => i.apps);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedTab, setSelectedTab] = useState('全部');
  const [searchword, setSearchword] = useState<keyof typeof TypeEnum>('movie_bt');
  const [dataObj, setDataObj] = useImmer<{ [key: string]: any[] }>({});
  
  const isDebug = apps?.__ENV__ === 'DEV';

  const tabs = ['全部', '动作', '喜剧', '科幻'];

  const getData = useCallback(
    async (page: number = 1, type: keyof typeof TypeEnum = 'movie_bt') => {
      return new Promise(async resolve => {
        if (page <= 1 && flatListRef.current) {
          setIsRefreshing(true);
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
        try {
          let url =
          page <= 1
            ? `${host}movie_bt/movie_bt_series/dyy`
            : `${host}movie_bt/movie_bt_series/dyy/page/${page}`;
          if (type === 'movie_bt') {
            url =
              page <= 1
                ? `${host}movie_bt/movie_bt_series/dyy`
                : `${host}movie_bt/movie_bt_series/dyy/page/${page}`;
          }
          if (type === 'dbtop250') {
            url = page <= 1 ? `${host}dbtop250` : `${host}dbtop250/page/${page}`;
          }
          if (type === 'zuixindianying') {
            url = page <= 1 ? `${host}zuixindianying` : `${host}zuixindianying/page/${page}`;
          }
          if (type === 'dongmanjuchangban') {
            url = page <= 1 ? `${host}dongmanjuchangban` : `${host}dongmanjuchangban/page/${page}`;
          }
          if (type === 'benyueremen') {
            url = page <= 1 ? `${host}benyueremen` : `${host}benyueremen/page/${page}`;
          }
          if (type === 'gcj') {
            url = page <= 1 ? `${host}gcj` : `${host}gcj/page/${page}`;
          }
          if (type === 'meijutt') {
            url = page <= 1 ? `${host}meijutt` : `${host}meijutt/page/${page}`;
          }
          if (type === 'hanjutv') {
            url = page <= 1 ? `${host}hanjutv` : `${host}hanjutv/page/${page}`;
          }
          if (type === 'fanju') {
            url = page <= 1 ? `${host}fanju` : `${host}fanju/page/${page}`;
          }
          if (jssdk) {
            const data = await jssdk?.puppeteer({
              url: url,
              jscode: `${jsCrawler}`,
              debug: isDebug,
              wait: 2000,
              timeout: 1000 * 30,
              callback: () => {},
            });
            resolve(data);
            if (data?.items?.length) {
              dispatch(setDBData(data?.items));
              setDataObj(_dataObj => {
                if (page === 1) {
                  return {
                    1: data,
                  };
                }
                _dataObj[page] = data;
                return _dataObj;
              });
            }
          }
        } catch (error) {
          
        } finally {
          setIsRefreshing(false);
        }
      });
    },
    [],
  );

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await getData(1, searchword);
    } catch (error) {
      
    } finally {
      setIsRefreshing(false);
    }
 
  }, [dataObj, searchword]);

  const nextPage = useMemo(() => {
    return (Object.keys(dataObj || {})?.length || 0) + 1;
  }, [dataObj])

  // 上拉加载更多
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = (Object.keys(dataObj || {})?.length || 1) + 1;
      await getData(nextPage, searchword);
    } catch (error) {
      
    } finally {
      setIsLoadingMore(false);
    }
    
  }, [isLoadingMore, dataObj, searchword]);

  const list = useMemo(() => {
    const _list: Array<BookItem> = [];
    for (const key in dataObj) {
      const items: any = lodash.get(dataObj, `[${key}]['items']`, []);
      _list.push(...items);
    }
    return _list;
  }, [dataObj]);

  useEffect(() => {
    getData(1, searchword);
  }, [searchword]);

  // 渲染 tabs
  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContainer}>
      {Object.entries(TypeEnum).map(([key, label]) => (
        <TouchableOpacity key={key} style={styles.tabItem} onPress={() => {
          setSelectedTab(label);
          setSearchword(key);
        }}>
          <Text style={[styles.tabText, selectedTab === label && styles.selectedTab]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header
        mode="small"
        style={{
          height: 50
        }}
      >
        <Appbar.Content titleStyle={{fontSize: 18,}} title="分类" />
      </Appbar.Header>
      {/* Tabs */}
      <View style={tw`flex-grow`}>
        <View>
          {renderTabs()}
        </View>
        <View style={tw`flex-grow h-0`}>
          {
            jssdk.AdBanner ? <jssdk.AdBanner /> : undefined
          }
          {/* 电影列表 */}
          <FlatList
            ref={flatListRef}
            data={list}
            renderItem={({ item }: any) => {
              return <Item url={item?.url} 
                onPress={(info: any) => {
                  navigation.navigate(`Details`, {
                    name: info.name,
                    url: encodeURIComponent(info.url)
                  })
                }}
              />
            }}
            keyExtractor={(item) => item.url}
            numColumns={2} // 设置两列
            contentContainerStyle={styles.movieList}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            onEndReached={handleLoadMore} // 触发加载更多
            onEndReachedThreshold={0.1} // 距底部多远触发加载更多
            ListFooterComponent={() => <View style={tw`h-[180px] justify-start items-center`}>{(isLoadingMore && nextPage > 1) && <ActivityIndicator size="large" color="#0000ff" />}</View>}
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  tabText: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  selectedTab: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  tabsScrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});

export default MovieListPage;
