import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import lodash from 'lodash';
import { setDBData, useAppSelector, useDispatch } from '@/_UIHOOKS_';
import { useImmer } from 'use-immer';
import jssdk, { RequestOptions } from '@htyf-mp/js-sdk'
import Item from '@/components/item';
import jsCrawler, { host } from '@/utils/js-crawler';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';

export async function getSearch(
  query: { name: string; page: number },
  opt?: Partial<RequestOptions>,
) {
  const url = `${host}daoyongjiekoshibushiyoubing?q=${query?.name}&f=_all&p=${query.page || 1}`;
  const data = await jssdk?.puppeteer({
    url: url,
    jscode: `${jsCrawler}`,
    debug: false,
    wait: 2000,
    timeout: 1000 * 10,
    callback: () => {},
    ...opt,
  });
  return data;
}

export async function auth() {
  const query = { name: '我', page: 1 };
  let data = await getSearch(query, {
    debug: true,
    wait: 0,
    timeout: 1000 * 60 * 3,
  });
  return !!data;
}

let isF = true;

const MovieSearchPage = () => {
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const apps = useAppSelector(i => i.apps);
  const [dataObj, setDataObj] = useImmer<{ [key: string]: any[] }>({});
  const [searchword, setSearchword] = useState('');
  const [loading, setLoading] = useState(false);

  const isDebug = apps?.__ENV__ === 'DEV';

  const getData = useCallback(
    async (searchword: string = '', page: number = 1) => {
      return new Promise(async resolve => {
        if (!searchword) {
          return;
        }
        if (page <= 1 && flatListRef.current) {
          setIsRefreshing(true);
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
        try {
          if (jssdk) {
            setLoading(true);
            if (isF) {
              isF = false;
              await auth();
            }
            const data = await getSearch({
              name: searchword,
              page: page,
            });
            console.error(data);
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
            setLoading(false);
          }
        } catch (error) {
          
        } finally {
          setIsRefreshing(false);
        }
      });
    },
    [isDebug],
  );

  const list = useMemo(() => {
    const _list: Array<BookItem> = [];
    for (const key in dataObj) {
      const items: any = lodash.get(dataObj, `[${key}]['items']`, []);
      _list.push(...items);
    }
    return _list;
  }, [dataObj]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await getData(searchword);
    setIsRefreshing(false);
  }, [searchword]);

  const nextPage = useMemo(() => {
    return (Object.keys(dataObj || {})?.length || 0) + 1;
  }, [dataObj])

  // 上拉加载更多
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    // 模拟加载更多数据
    await getData(searchword);
    setIsLoadingMore(false);
  }, [isLoadingMore, searchword]);

  return (
    <View style={styles.container}>
      <Appbar.Header
        mode="small"
        style={{
          height: 50
        }}
      >
        <Appbar.BackAction onPress={() => {
          navigation.goBack();
        }} />
        <Appbar.Content titleStyle={{fontSize: 18,}} title="搜索" />
      </Appbar.Header>
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholderTextColor="#333"
          style={styles.searchInput}
          placeholder="搜索电影..."
          value={searchword}
          onChangeText={setSearchword}
          onSubmitEditing={() => {
            getData(searchword, 1);
          }}
        />
      </View>

      {/* 电影列表 */}
      <FlatList
        ref={flatListRef}
        data={list}
        renderItem={({ item }: any) => {
          return <Item url={item.url} 
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
        ItemSeparatorComponent={() => {
          return <>
            {
              jssdk.AdBanner ? <jssdk.AdBanner /> : undefined
            }
          </>
        }}
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
